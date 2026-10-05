import math
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.ai.factory import get_ai_provider
from app.models.embedding import EmbeddingChunk
from app.models.transcript import TranscriptSegment

class VectorService:
    @staticmethod
    def cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
        """Compute cosine similarity between two float vectors."""
        if not vec_a or not vec_b or len(vec_a) != len(vec_b):
            return 0.0
        dot = sum(a * b for a, b in zip(vec_a, vec_b))
        norm_a = math.sqrt(sum(a * a for a in vec_a))
        norm_b = math.sqrt(sum(b * b for b in vec_b))
        if norm_a == 0.0 or norm_b == 0.0:
            return 0.0
        return dot / (norm_a * norm_b)

    @classmethod
    async def index_meeting_transcript(
        cls,
        db: AsyncSession,
        meeting_id: str
    ):
        """
        Group consecutive transcript segments into overlapping context chunks,
        generate embeddings, and save EmbeddingChunk records.
        """
        stmt = (
            select(TranscriptSegment)
            .where(TranscriptSegment.meeting_id == meeting_id)
            .order_by(TranscriptSegment.start_time)
        )
        result = await db.execute(stmt)
        segments = result.scalars().all()
        if not segments:
            return

        ai_provider = get_ai_provider()
        
        # Chunking strategy: 2-3 segments per chunk with 1 segment overlap
        chunk_size = 2
        overlap = 1
        step = max(1, chunk_size - overlap)

        for i in range(0, len(segments), step):
            window = segments[i : i + chunk_size]
            if not window:
                break
            
            chunk_text = " ".join(seg.text for seg in window)
            chunk_start = window[0].start_time
            chunk_end = window[-1].end_time
            seg_ids = [seg.id for seg in window]

            # Generate embedding vector
            embedding = await ai_provider.get_embedding(chunk_text)

            chunk_obj = EmbeddingChunk(
                meeting_id=meeting_id,
                transcript_segment_ids=seg_ids,
                text=chunk_text,
                start_time=chunk_start,
                end_time=chunk_end,
                embedding=embedding
            )
            db.add(chunk_obj)

        await db.flush()

    @classmethod
    async def search_meeting_context(
        cls,
        db: AsyncSession,
        meeting_id: str,
        query: str,
        top_k: int = 4
    ) -> list[dict]:
        """
        Search chunks strictly belonging to the given meeting_id.
        Returns top matching chunks with text, start_time, end_time, score.
        """
        ai_provider = get_ai_provider()
        query_embedding = await ai_provider.get_embedding(query)

        stmt = select(EmbeddingChunk).where(EmbeddingChunk.meeting_id == meeting_id)
        result = await db.execute(stmt)
        chunks = result.scalars().all()

        scored_chunks = []
        for chunk in chunks:
            sim = cls.cosine_similarity(query_embedding, chunk.embedding)
            scored_chunks.append({
                "chunk_id": chunk.id,
                "text": chunk.text,
                "start_time": chunk.start_time,
                "end_time": chunk.end_time,
                "score": sim
            })

        # Sort by similarity descending
        scored_chunks.sort(key=lambda x: x["score"], reverse=True)
        return scored_chunks[:top_k]
