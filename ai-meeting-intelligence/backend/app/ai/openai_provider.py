import json
import httpx
from app.ai.base import BaseAIProvider
from app.config import settings
from app.schemas.insights import MeetingIntelligenceSchema

class OpenAIProvider(BaseAIProvider):
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.base_url = "https://api.openai.com/v1"

    async def transcribe(self, audio_path: str) -> list[dict]:
        # OpenAI Whisper API or fallback
        if not self.api_key:
            from app.ai.local_mock_provider import LocalMockAIProvider
            return await LocalMockAIProvider().transcribe(audio_path)
        
        url = f"{self.base_url}/audio/transcriptions"
        headers = {"Authorization": f"Bearer {self.api_key}"}
        try:
            with open(audio_path, "rb") as f:
                files = {"file": f}
                data = {"model": "whisper-1", "response_format": "verbose_json"}
                async with httpx.AsyncClient(timeout=120.0) as client:
                    resp = await client.post(url, headers=headers, files=files, data=data)
                    if resp.status_code == 200:
                        segments = resp.json().get("segments", [])
                        return [
                            {
                                "start": s.get("start", 0.0),
                                "end": s.get("end", 0.0),
                                "speaker": "Speaker 1",
                                "text": s.get("text", "").strip()
                            }
                            for s in segments
                        ]
        except Exception:
            pass
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

Return a JSON object conforming strictly to:
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
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "gpt-4o-mini",
            "messages": [{"role": "user", "content": prompt}],
            "response_format": {"type": "json_object"}
        }
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)
            if resp.status_code == 200:
                content = resp.json()["choices"][0]["message"]["content"]
                return MeetingIntelligenceSchema(**json.loads(content))
        from app.ai.local_mock_provider import LocalMockAIProvider
        return await LocalMockAIProvider().analyze_transcript(transcript_text, meeting_date)

    async def get_embedding(self, text: str) -> list[float]:
        if not self.api_key:
            from app.ai.local_mock_provider import LocalMockAIProvider
            return await LocalMockAIProvider().get_embedding(text)

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "text-embedding-3-small",
            "input": text[:8000]
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(f"{self.base_url}/embeddings", headers=headers, json=payload)
            if resp.status_code == 200:
                return resp.json()["data"][0]["embedding"]
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
If not in context, respond: "I couldn't find that information in this meeting."

CONTEXT:
{context_str}

QUESTION:
{question}

Return JSON with format:
{{
  "answer": "string",
  "source_timestamps": [0.0]
}}
"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "gpt-4o-mini",
            "messages": [{"role": "user", "content": prompt}],
            "response_format": {"type": "json_object"}
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)
            if resp.status_code == 200:
                content = resp.json()["choices"][0]["message"]["content"]
                return json.loads(content)
        from app.ai.local_mock_provider import LocalMockAIProvider
        return await LocalMockAIProvider().answer_question(question, retrieved_contexts)
