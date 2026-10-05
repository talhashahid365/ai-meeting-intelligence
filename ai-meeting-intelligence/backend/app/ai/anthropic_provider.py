import json
import re
import httpx
from app.ai.base import BaseAIProvider
from app.config import settings
from app.schemas.insights import MeetingIntelligenceSchema

class AnthropicProvider(BaseAIProvider):
    def __init__(self):
        self.api_key = settings.ANTHROPIC_API_KEY
        self.base_url = "https://api.anthropic.com/v1"

    async def transcribe(self, audio_path: str) -> list[dict]:
        from app.ai.local_mock_provider import LocalMockAIProvider
        return await LocalMockAIProvider().transcribe(audio_path)

    async def analyze_transcript(
        self,
        transcript_text: str,
        meeting_date: str | None = None
    ) -> MeetingIntelligenceSchema:
        if not self.api_key:
            from app.ai.local_mock_provider import LocalMockAIProvider
            return await LocalMockAIProvider().analyze_transcript(transcript_text, meeting_date)

        prompt = f"""
You are an expert executive meeting analyst. Analyze this transcript.
Meeting Date: {meeting_date or 'Not specified'}

Return ONLY valid JSON matching this schema:
{{
  "meeting_title": "string",
  "executive_summary": "string",
  "detailed_summary": "string",
  "participants": ["string"],
  "key_points": [{{"topic": "string", "description": "string", "timestamp": 0.0}}],
  "decisions": [{{"decision": "string", "timestamp": 0.0}}],
  "action_items": [{{"task": "string", "owner": "string", "deadline": "string", "timestamp": 0.0}}],
  "deadlines": [{{"description": "string", "date": "string or null", "original_expression": "string", "timestamp": 0.0}}],
  "unresolved_issues": [{{"issue": "string", "description": "string", "timestamp": 0.0}}],
  "follow_up_items": [{{"item": "string", "timestamp": 0.0}}],
  "sentiment": {{"label": "Positive | Neutral | Mixed | Negative", "explanation": "string"}}
}}

TRANSCRIPT:
{transcript_text}
"""
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
        payload = {
            "model": "claude-3-5-sonnet-20241022",
            "max_tokens": 4096,
            "messages": [{"role": "user", "content": prompt}]
        }
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(f"{self.base_url}/messages", headers=headers, json=payload)
            if resp.status_code == 200:
                content = resp.json()["content"][0]["text"]
                # Extract JSON if enclosed in markdown blocks
                m = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", content)
                json_str = m.group(1) if m else content
                return MeetingIntelligenceSchema(**json.loads(json_str))
        from app.ai.local_mock_provider import LocalMockAIProvider
        return await LocalMockAIProvider().analyze_transcript(transcript_text, meeting_date)

    async def get_embedding(self, text: str) -> list[float]:
        from app.ai.local_mock_provider import LocalMockAIProvider
        return await LocalMockAIProvider().get_embedding(text)

    async def answer_question(
        self,
        question: str,
        retrieved_contexts: list[dict]
    ) -> dict:
        if not self.api_key:
            from app.ai.local_mock_provider import LocalMockAIProvider
            return await LocalMockAIProvider().answer_question(question, retrieved_contexts)

        context_str = "\n".join(
            f"[{c.get('start_time', 0.0)}s - {c.get('end_time', 0.0)}s] {c.get('text', '')}"
            for c in retrieved_contexts
        )
        prompt = f"""
Answer the user's question using ONLY the meeting context below.
If not found, respond: "I couldn't find that information in this meeting."

CONTEXT:
{context_str}

QUESTION:
{question}

Return ONLY valid JSON format:
{{
  "answer": "string",
  "source_timestamps": [0.0]
}}
"""
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
        payload = {
            "model": "claude-3-5-sonnet-20241022",
            "max_tokens": 1024,
            "messages": [{"role": "user", "content": prompt}]
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(f"{self.base_url}/messages", headers=headers, json=payload)
            if resp.status_code == 200:
                content = resp.json()["content"][0]["text"]
                m = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", content)
                json_str = m.group(1) if m else content
                return json.loads(json_str)
        from app.ai.local_mock_provider import LocalMockAIProvider
        return await LocalMockAIProvider().answer_question(question, retrieved_contexts)
