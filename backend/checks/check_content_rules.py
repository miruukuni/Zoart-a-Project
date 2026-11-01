from pathlib import Path
import sys
from types import SimpleNamespace
from uuid import UUID
from unittest import TestCase, main
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from fastapi import HTTPException
from app import gemini
from app.project_moderation import ModerationCache, ReportDecision
from app.project_safety import plain_contact

class ContactChecks(TestCase):
    def test_plain_contacts(self):
        for value in ["hello@uci.edu","Troy Ngo: troy@example.com","+1 (949) 555-0100","Discord: @troy.ngo","Meet at the library","@my.handle"]:
            self.assertEqual(plain_contact(value),value)
    def test_contact_links(self):
        for value in ["https://uci.edu","http://example.com","www.example.com","github.com/team/repo","discord.gg/invite","javascript:alert(1)","mailto:hello@uci.edu","//evil.example/x","127.0.0.1:8000","[::1]","https%3A%2F%2Fuci.edu","ｅｘａｍｐｌｅ．ｃｏｍ","例子.中国"]:
            with self.subTest(value=value),self.assertRaises(ValueError): plain_contact(value)

class ReportReviewChecks(TestCase):
    def setUp(self):
        self.owner=UUID("11111111-1111-4111-8111-111111111111")
        self.request=SimpleNamespace(client=SimpleNamespace(host="testclient"))
        for name,value in [("gate",gemini.GeminiGate()),("_report_cache",ModerationCache())]:
            patcher=patch.object(gemini,name,value);patcher.start();self.addCleanup(patcher.stop)

    def test_rejected_text_and_retries(self):
        with patch.object(gemini,"ask_gemini",return_value=ReportDecision(verdict="block")) as ai:
            for _ in range(2):
                with self.assertRaises(HTTPException) as error: gemini.moderate_report("I'm the best at fighting games",self.owner,self.request)
                self.assertEqual(error.exception.status_code,422)
            self.assertEqual(ai.call_count,1)

    def test_relevant_report_payload_and_cache(self):
        with patch.object(gemini,"ask_gemini",return_value=ReportDecision(verdict="allow")) as ai:
            reason="This post asks for passwords at https://evil.example; contact test@example.invalid"
            gemini.moderate_report(reason,self.owner,self.request)
            gemini.moderate_report(reason,self.owner,self.request)
            self.assertEqual(ai.call_count,1)
            self.assertEqual(set(ai.call_args.args[1]),{"reason"})
            for private in ["evil.example","test@example.invalid",str(self.owner)]: self.assertNotIn(private,str(ai.call_args.args[1]))

    def test_unavailable_invalid_or_busy_ai_cannot_approve(self):
        for output in [None,{"verdict":"maybe"}]:
            gemini.gate=gemini.GeminiGate()
            with patch.object(gemini,"ask_gemini",return_value=output),self.assertRaises(HTTPException) as error:
                gemini.moderate_report("A reason for review",self.owner,self.request)
            self.assertEqual(error.exception.status_code,503)
        gemini.gate=gemini.GeminiGate()
        with gemini.gate.enter("testclient"),self.assertRaises(HTTPException) as error:
            gemini.moderate_report("A reason for review",self.owner,self.request)
        self.assertEqual(error.exception.status_code,429)

if __name__=="__main__":main()
