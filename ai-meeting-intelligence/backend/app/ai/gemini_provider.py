import os
import json
import mimetypes
import asyncio
import httpx
from app.ai.base import BaseAIProvider
from app.config import settings
from app.schemas.insights import MeetingIntelligenceSchema

class GeminiAIProvider(BaseAIProvider):
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
        self.upload_url = "https://generativelanguage.googleapis.com/upload/v1beta/files"

    async def _upload_file(self, client: httpx.AsyncClient, file_path: str) -> dict:
        """Upload a local media file to the Gemini File API using the resumable upload protocol."""
        mime_type = mimetypes.guess_type(file_path)[0] or "audio/wav"
        file_size = os.path.getsize(file_path)
        display_name = os.path.basename(file_path)

        # Step 1: start resumable upload session
        start_resp = await client.post(
            self.upload_url,
            headers={
                "x-goog-api-key": self.api_key,
                "X-Goog-Upload-Protocol": "resumable",
                "X-Goog-Upload-Command": "start",
                "X-Goog-Upload-Header-Content-Length": str(file_size),
                "X-Goog-Upload-Header-Content-Type": mime_type,
                "Content-Type": "application/json",
            },
            json={"file": {"display_name": display_name}},
        )
        start_resp.raise_for_status()
        upload_url = start_resp.headers.get("x-goog-upload-url")
        if not upload_url:
            raise RuntimeError("Gemini file upload did not return an upload URL")

        # Step 2: upload the raw bytes and finalize
        with open(file_path, "rb") as f:
            file_bytes = f.read()
        upload_resp = await client.post(
            upload_url,
            headers={
                "Content-Length": str(file_size),
                "X-Goog-Upload-Offset": "0",
                "X-Goog-Upload-Command": "upload, finalize",
            },
            content=file_bytes,
        )
        upload_resp.raise_for_status()
        return upload_resp.json()["file"]

    async def _wait_for_file_active(self, client: httpx.AsyncClient, file_name: str) -> dict:
        """Poll the File API until Gemini has finished processing the uploaded media."""
        for _ in range(60):  # up to ~5 minutes
            resp = await client.get(f"{self.base_url}/{file_name}", headers={"x-goog-api-key": self.api_key})
            resp.raise_for_status()
            file_info = resp.json()
            state = file_info.get("state")
            if state == "ACTIVE":
                return file_info
            if state == "FAILED":
                raise RuntimeError(f"Gemini failed to process uploaded media: {file_info}")
            await asyncio.sleep(5)
        raise RuntimeError("Timed out waiting for Gemini to process uploaded media")

    async def transcribe(self, audio_path: str) -> list[dict]:
        """
        Real transcription using Gemini's native multimodal audio understanding.
        Uploads the audio/video file via the File API, then asks Gemini to produce
        an exact, timestamped, speaker-labeled transcript of what was actually said.
        """
        if not self.api_key or not os.path.exists(audio_path):
            from app.ai.local_mock_provider import LocalMockAIProvider
            return await LocalMockAIProvider().transcribe(audio_path)

        prompt = """
Transcribe this recording EXACTLY as spoken, word for word. Do not summarize, paraphrase,
invent, or translate the wording unless the speaker is speaking a different language than
English (in that case, transcribe in the original language/script the speaker actually used,
do NOT substitute unrelated sentences). Preserve filler words and the real meaning.

Split the transcript into short segments (a few seconds to ~20 seconds each) aligned to natural
pauses, and label distinct speakers as "Speaker 1", "Speaker 2", etc. based on voice changes.

Return ONLY a valid JSON array (no markdown fences, no extra text) where each element is:
{"start": 0.0, "end": 0.0, "speaker": "Speaker 1", "text": "exact spoken words"}
"""
        async with httpx.AsyncClient(timeout=300.0) as client:
            uploaded = await self._upload_file(client, audio_path)
            file_info = await self._wait_for_file_active(client, uploaded["name"])

            gen_resp = await client.post(
                f"{self.base_url}/models/gemini-2.5-flash:generateContent",
                headers={"x-goog-api-key": self.api_key},
                json={
                    "contents": [{
                        "parts": [
                            {"file_data": {"mime_type": file_info["mimeType"], "file_uri": file_info["uri"]}},
                            {"text": prompt},
                        ]
                    }],
                    "generationConfig": {"responseMimeType": "application/json"},
                },
            )
            if gen_resp.status_code != 200:
                # Don't silently degrade to the low-accuracy mock transcriber (free Google STT,
                # English-only) when a real key was configured but the call failed — raise so the
                # meeting is marked FAILED with the actual Gemini error visible to the user.
                raise RuntimeError(
                    f"Gemini transcription failed ({gen_resp.status_code}): {gen_resp.text[:500]}"
                )
            data = gen_resp.json()
            text_content = data["candidates"][0]["content"]["parts"][0]["text"]
            segments = json.loads(text_content)
            if isinstance(segments, list) and segments:
                return segments
            raise RuntimeError("Gemini returned an empty/invalid transcript segment list")

    async def analyze_transcript(
        self,
        transcript_text: str,
        meeting_date: str | None = None
    ) -> MeetingIntelligenceSchema:
        if not self.api_key:
            from app.ai.local_mock_provider import LocalMockAIProvider
            return await LocalMockAIProvider().analyze_transcript(transcript_text, meeting_date)

        prompt = f"""
You are an expert executive meeting analyst. Analyze the following meeting transcript.
Meeting Date: {meeting_date or 'Not specified'}

CRITICAL INSTRUCTIONS:
- Use ONLY the facts directly stated in the transcript.
- Do NOT hallucinate or assume details not present.
- Preserve uncertainty.
- Distinguish carefully between ideas/suggestions and confirmed decisions.
- Identify task ownership and extract deadlines (resolve relative dates using the meeting date).
- Include supporting timestamps in seconds for every key point, decision, action item, deadline, issue, and follow-up.
- Return ONLY valid JSON matching this schema:
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
        url = f"{self.base_url}/models/gemini-2.5-flash:generateContent"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "responseMimeType": "application/json"
            }
        }
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(url, json=payload, headers={"x-goog-api-key": self.api_key})
            if resp.status_code != 200:
                # Surface the REAL Gemini error instead of silently falling back to mock data,
                # so the meeting is marked FAILED with the actual reason (bad/incompatible key,
                # quota exceeded, API not enabled, etc.) rather than showing wrong intelligence.
                raise RuntimeError(
                    f"Gemini analyze_transcript failed ({resp.status_code}): {resp.text[:500]}"
                )

            data = resp.json()
            text_content = data["candidates"][0]["content"]["parts"][0]["text"]
            parsed_json = json.loads(text_content)
            return MeetingIntelligenceSchema(**parsed_json)

    async def get_embedding(self, text: str) -> list[float]:
        if not self.api_key:
            from app.ai.local_mock_provider import LocalMockAIProvider
            return await LocalMockAIProvider().get_embedding(text)

        url = f"{self.base_url}/models/gemini-embedding-001:embedContent"
        payload = {
            "model": "models/gemini-embedding-001",
            "content": {"parts": [{"text": text[:2000]}]},
            "outputDimensionality": 768
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload, headers={"x-goog-api-key": self.api_key})
            if resp.status_code == 200:
                return resp.json()["embedding"]["values"]
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
You are an AI meeting assistant. Answer the user's question using ONLY the provided meeting context.
If the information is not clearly present in the context, you MUST respond EXACTLY with:
"I couldn't find that information in this meeting."

Provide supporting timestamps (in seconds as floats) in your JSON output.

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
        url = f"{self.base_url}/models/gemini-2.5-flash:generateContent"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"responseMimeType": "application/json"}
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload, headers={"x-goog-api-key": self.api_key})
            if resp.status_code == 200:
                data = resp.json()
                text_content = data["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(text_content)
            from app.ai.local_mock_provider import LocalMockAIProvider
            return await LocalMockAIProvider().answer_question(question, retrieved_contexts)
