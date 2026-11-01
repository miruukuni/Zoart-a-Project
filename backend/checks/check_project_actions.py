"""API authorization and moderation regressions; no external services are used."""
from pathlib import Path
import sys
from types import SimpleNamespace
from unittest import TestCase, main
from unittest.mock import MagicMock, patch
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from fastapi import HTTPException
from fastapi.testclient import TestClient
from app import gemini

OWNER = "11111111-1111-4111-8111-111111111111"
PROJECT = "22222222-2222-4222-8222-222222222222"
BODY = dict(title="Edited project",author="Test",description="Build an educational project.",contact_info="test@example.invalid",tags=["Python"])

class ProjectActionsChecks(TestCase):
    def setUp(self):
        self.db = MagicMock()
        self.db.auth.get_user.return_value = SimpleNamespace(user=SimpleNamespace(id=OWNER,is_anonymous=False))
        self.db.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value.data = [{"id":PROJECT}]
        self.db.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [{"id":PROJECT,"owner_id":PROJECT}]
        self.db.table.return_value.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value.data = []
        self.db.table.return_value.select.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value.data = []
        self.db.rpc.return_value.execute.return_value.data = True
        self.client = TestClient(gemini.app)
        db_patch = patch.object(gemini,"database",return_value=self.db)
        moderation_patch = patch.object(gemini,"moderate_project")
        report_patch = patch.object(gemini,"moderate_report")
        db_patch.start(); self.moderate = moderation_patch.start()
        self.report_review = report_patch.start()
        self.addCleanup(db_patch.stop); self.addCleanup(moderation_patch.stop); self.addCleanup(report_patch.stop)

    def post(self, action, body=None, signed_in=True):
        return self.client.post(f"/api/projects/{PROJECT}/{action}",json=body,headers={"Authorization":"Bearer mock-token"} if signed_in else {})

    def test_guests_cannot_edit_delete_or_report(self):
        for action, body in [("edit",BODY),("delete",None),("reports",{"reason":"A report for review"})]:
            self.assertEqual(self.post(action,body,False).status_code,401)
        self.db.rpc.assert_not_called(); self.moderate.assert_not_called()

    def test_non_owner_edit_is_rejected_before_moderation(self):
        self.db.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value.data = []
        self.assertEqual(self.post("edit",BODY).status_code,404)
        self.moderate.assert_not_called(); self.db.rpc.assert_not_called()

    def test_edit_uses_verified_identity_and_review_before_writing(self):
        self.moderate.side_effect = lambda *args, **kwargs: self.db.rpc.assert_not_called()
        response=self.post("edit",{**BODY,"owner_id":PROJECT,"status":"active","moderation_approved":True})
        self.assertEqual(response.status_code,200,response.text)
        args=self.db.rpc.call_args.args[1]
        self.assertEqual(args["p_user_id"],OWNER)
        self.assertEqual(args["p_project_id"],PROJECT)
        self.assertNotIn("owner_id",args["p_project"])
        self.assertNotIn("status",args["p_project"])
        self.assertNotIn("moderation_approved",args["p_project"])

    def test_rejected_or_unavailable_review_never_writes(self):
        for code in [422,503,429]:
            self.moderate.side_effect=HTTPException(code,"Review failed")
            self.assertEqual(self.post("edit",BODY).status_code,code)
        self.db.rpc.assert_not_called()

    def test_edit_preserves_field_limits_and_safe_links(self):
        for changes in [{"title":"x"*81},{"description":"x"*2001},{"application_url":"https://evil.example"},{"contact_info":"github.com/example"},{"tags":["Invented"]}]:
            self.assertEqual(self.post("edit",{**BODY,**changes}).status_code,422)
        self.db.rpc.assert_not_called()

    def test_atomic_edit_rechecks_ownership(self):
        self.db.rpc.return_value.execute.return_value.data=None
        self.assertEqual(self.post("edit",BODY).status_code,404)

    def test_delete_uses_verified_identity_and_refuses_non_owner(self):
        self.assertEqual(self.post("delete",{"user_id":PROJECT}).status_code,200)
        self.assertEqual(self.db.rpc.call_args.args[1]["p_user_id"],OWNER)
        self.db.rpc.return_value.execute.return_value.data=False
        self.assertEqual(self.post("delete").status_code,404)

    def test_report_uses_verified_identity_and_retains_reason(self):
        response=self.post("reports",{"reason":"  Misleading project details.  ","reporter_id":PROJECT})
        self.assertEqual(response.status_code,201,response.text)
        self.assertEqual(self.db.rpc.call_args.args[1],{"p_project_id":PROJECT,"p_user_id":OWNER,"p_reason":"Misleading project details."})
        self.moderate.assert_not_called()

    def test_empty_short_or_oversized_reports_are_rejected(self):
        for reason in ["", "short", " "*15, "x"*2001]:
            self.assertEqual(self.post("reports",{"reason":reason}).status_code,422)
        self.db.rpc.assert_not_called()

    def test_duplicate_daily_and_own_report_errors(self):
        for code,status in [("PZ006",409),("PZ007",429),("PZ008",422)]:
            error=Exception("database error"); error.code=code
            self.db.rpc.return_value.execute.side_effect=error
            self.assertEqual(self.post("reports",{"reason":"A valid report explanation."}).status_code,status)

    def test_deleted_project_cannot_be_reported(self):
        self.db.rpc.return_value.execute.return_value.data=False
        self.assertEqual(self.post("reports",{"reason":"A valid report explanation."}).status_code,404)

    def test_failed_report_review_prevents_storage(self):
        for code in [422,503,429]:
            self.report_review.side_effect=HTTPException(code,"Report check failed")
            self.assertEqual(self.post("reports",{"reason":"An unrelated comment"}).status_code,code)
        self.db.rpc.assert_not_called()

    def test_self_missing_duplicate_and_daily_reports_skip_ai(self):
        select=self.db.table.return_value.select.return_value
        select.eq.return_value.execute.return_value.data=[]
        self.assertEqual(self.post("reports",{"reason":"A valid concern about a post"}).status_code,404)
        select.eq.return_value.execute.return_value.data=[{"id":PROJECT,"owner_id":OWNER}]
        self.assertEqual(self.post("reports",{"reason":"A valid concern about a post"}).status_code,422)
        select.eq.return_value.execute.return_value.data=[{"id":PROJECT,"owner_id":PROJECT}]
        select.eq.return_value.eq.return_value.limit.return_value.execute.return_value.data=[{"id":PROJECT}]
        self.assertEqual(self.post("reports",{"reason":"A valid concern about a post"}).status_code,409)
        select.eq.return_value.eq.return_value.limit.return_value.execute.return_value.data=[]
        from datetime import datetime,timezone
        select.eq.return_value.order.return_value.limit.return_value.execute.return_value.data=[{"project_id":str(index),"created_at":datetime.now(timezone.utc).isoformat()} for index in range(10)]
        self.assertEqual(self.post("reports",{"reason":"A valid concern about a post"}).status_code,429)
        self.report_review.assert_not_called();self.db.rpc.assert_not_called()

if __name__=="__main__": main()
