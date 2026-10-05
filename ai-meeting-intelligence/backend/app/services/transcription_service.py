from app.ai.factory import get_ai_provider

class TranscriptionService:
    @staticmethod
    async def transcribe_audio(audio_path: str) -> list[dict]:
        """
        Transcribe audio into structured timestamped segments.
        Each segment contains:
          - start (float)
          - end (float)
          - speaker (str)
          - text (str)
        """
        ai_provider = get_ai_provider()
        segments = await ai_provider.transcribe(audio_path)
        
        # Ensure segments are properly ordered by start time
        segments.sort(key=lambda s: s.get("start", 0.0))
        return segments
