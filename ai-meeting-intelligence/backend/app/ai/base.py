from abc import ABC, abstractmethod
from app.schemas.insights import MeetingIntelligenceSchema

class BaseAIProvider(ABC):
    @abstractmethod
    async def transcribe(self, audio_path: str) -> list[dict]:
        """
        Transcribe audio file into structured segments.
        Returns: list of dicts with keys: 'start', 'end', 'speaker', 'text'
        """
        pass

    @abstractmethod
    async def analyze_transcript(
        self,
        transcript_text: str,
        meeting_date: str | None = None
    ) -> MeetingIntelligenceSchema:
        """
        Analyze transcript and produce strict structured MeetingIntelligenceSchema.
        """
        pass

    @abstractmethod
    async def get_embedding(self, text: str) -> list[float]:
        """
        Compute embedding vector for text chunk.
        """
        pass

    @abstractmethod
    async def answer_question(
        self,
        question: str,
        retrieved_contexts: list[dict]
    ) -> dict:
        """
        Answer question using ONLY the provided meeting contexts.
        Returns: {"answer": str, "source_timestamps": list[float]}
        """
        pass
