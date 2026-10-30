"""Offline regression checks. Supabase and Gemini calls are mocked."""
from pathlib import Path
import sys
from types import SimpleNamespace
import unittest
from unittest.mock import MagicMock, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from fastapi import HTTPException
from fastapi.testclient import TestClient
from app import gemini
from app.project_moderation import ModerationCache, ModerationDecision, review_payload


OWNER = "11111111-1111-4111-8111-111111111111"
OTHER = "22222222-2222-4222-8222-222222222222"
ALLOW = ModerationDecision(verdict="allow", category="none")
PROJECT = dict(title="Study space finder", author="Private Author",
               description="Map available study spaces and recruit Python collaborators.",
               contact_info="private@example.invalid", application_url="https://forms.gle/example",
               tags=["cs", "Python"], major_ids=["CS"])


class SubmissionChecks(unittest.TestCase):
    def setUp(self):
        self.db = MagicMock()
        self.db.auth.get_user.return_value = SimpleNamespace(user=SimpleNamespace(id=OWNER, is_anonymous=False))
        self.client = TestClient(gemini.app)
        self.patches = [patch.object(gemini, "database", return_value=self.db),
                        patch.object(gemini, "ask_gemini", return_value=ALLOW),
                        patch.object(gemini, "get_majors", return_value=[dict(id="CS", name="Computer Science", degree="B.S.")]),
                        patch.object(gemini, "gate", gemini.GeminiGate()),
                        patch.object(gemini, "_moderation_cache", ModerationCache())]
        started = [item.start() for item in self.patches]
        self.ai = started[1]
        for item in self.patches:
            self.addCleanup(item.stop)

    def post(self, body=None, signed_in=True):
        return self.client.post("/api/projects", json=PROJECT if body is None else body,
                                headers={"Authorization": "Bearer mock-user-token"} if signed_in else {})

    def assert_no_write(self):
        self.db.table.assert_not_called()
        self.db.rpc.assert_not_called()

    def fresh_gate(self):
        gemini.gate = gemini.GeminiGate()

    def test_approval_before_writes_and_verified_ownership(self):
        self.ai.side_effect = lambda *args, **kwargs: (self.assert_no_write() or ALLOW)
        result = self.post({**PROJECT, "owner_id": OTHER, "moderation_approved": True})
        self.assertEqual(result.status_code, 201, result.text)
        payload = self.ai.call_args.args[1]
        self.assertEqual(set(payload), {"title", "description", "tags", "majors"})
        self.assertEqual(payload["tags"], ["Computer Science", "Python"])
        self.assertEqual(payload["majors"], ["Computer Science (B.S.)"])
        self.assertNotIn("Private Author", str(payload))
        self.assertNotIn("private@example.invalid", str(payload))
        self.assertNotIn("forms.gle", str(payload))
        self.assertNotIn(OWNER, str(payload))
        args = self.db.rpc.call_args.args[1]
        self.assertEqual(args["p_owner_id"], OWNER)
        self.assertNotIn("moderation_approved", args["p_project"])

    def test_every_block_category_prevents_even_major_writes(self):
        for category in ["sexual_content", "hate_or_harassment", "harmful_activity", "scam_or_spam", "privacy", "not_a_project"]:
            with self.subTest(category=category):
                self.fresh_gate()
                self.ai.return_value = ModerationDecision(verdict="block", category=category)
                result = self.post({**PROJECT, "title": category})
                self.assertEqual(result.status_code, 422)
                self.assertIn("wasn't published", result.json()["detail"])
                self.assert_no_write()

    def test_outage_never_publishes_or_caches_approval(self):
        self.ai.side_effect = HTTPException(503, "AI unavailable")
        self.assertEqual(self.post().status_code, 503)
        self.assert_no_write()
        self.fresh_gate()
        self.ai.side_effect = None
        self.assertEqual(self.post().status_code, 201)
        self.assertEqual(self.ai.call_count, 2)

    def test_invalid_decision_and_client_bypass_are_rejected(self):
        for verdict in [None, {"verdict": "allow", "category": "privacy"}, {"verdict": "allow"}, {"verdict": "uncertain", "category": "none"}]:
            with self.subTest(verdict=verdict):
                self.fresh_gate()
                self.ai.return_value = verdict
                self.assertEqual(self.post({**PROJECT, "moderation_approved": True}).status_code, 503)
                self.assert_no_write()

    def test_guests_invalid_tokens_and_invalid_fields_do_not_use_ai(self):
        self.assertEqual(self.post(signed_in=False).status_code, 401)
        for change in [{"title": "x" * 81}, {"description": "x" * 2001},
                       {"application_url": "https://evil.example/"}, {"tags": ["Invented label"]},
                       {"major_ids": ["not a real major"]}]:
            self.assertEqual(self.post({**PROJECT, **change}).status_code, 422)
        self.db.auth.get_user.side_effect = ValueError("invalid token")
        self.assertEqual(self.post().status_code, 401)
        self.ai.assert_not_called()
        self.assert_no_write()

    def test_busy_ai_returns_retryable_error_without_writes(self):
        with gemini.gate.enter("testclient"):
            result = self.post()
        self.assertEqual(result.status_code, 429)
        self.assertIn("Retry-After", result.headers)
        self.ai.assert_not_called()
        self.assert_no_write()

    def test_retry_reuses_decision_but_edits_and_other_accounts_need_review(self):
        self.assertEqual(self.post().status_code, 201)
        self.assertEqual(self.post().status_code, 201)
        self.assertEqual(self.ai.call_count, 1)
        self.fresh_gate()
        self.assertEqual(self.post({**PROJECT, "description": "An edited project description."}).status_code, 201)
        self.db.auth.get_user.return_value.user.id = OTHER
        self.fresh_gate()
        self.assertEqual(self.post().status_code, 201)
        self.assertEqual(self.ai.call_count, 3)

    def test_blocked_retries_are_cached_without_publishing(self):
        self.ai.return_value = ModerationDecision(verdict="block", category="scam_or_spam")
        self.assertEqual(self.post().status_code, 422)
        self.assertEqual(self.post().status_code, 422)
        self.assertEqual(self.ai.call_count, 1)
        self.assert_no_write()


class CacheAndPrivacyChecks(unittest.TestCase):
    def test_cache_expires_and_has_a_hard_size_bound(self):
        cache = ModerationCache(limit=2, ttl=10)
        with patch("app.project_moderation.time.monotonic", return_value=100):
            for key in ["a", "b", "c"]:
                cache.put(key, ALLOW)
            self.assertEqual(len(cache.entries), 2)
            self.assertIsNone(cache.get("a"))
            self.assertEqual(cache.get("b"), ALLOW)
        with patch("app.project_moderation.time.monotonic", return_value=111):
            self.assertIsNone(cache.get("b"))

    def test_common_contacts_are_redacted_from_review_text(self):
        payload = review_payload("Email test@example.invalid", "Python project: https://uci.edu/private @myhandle +1 (949) 555-0100", ["Python"], [])
        self.assertNotIn("example.invalid", payload["title"])
        for value in ["uci.edu", "myhandle", "555-0100"]:
            self.assertNotIn(value, payload["description"])
        self.assertIn("Python project", payload["description"])


if __name__ == "__main__":
    unittest.main()
