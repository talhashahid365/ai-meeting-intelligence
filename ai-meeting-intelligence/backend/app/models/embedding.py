import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Text, DateTime, ForeignKey, Index, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class EmbeddingChunk(Base):
    __tablename__ = "embedding_chunks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    transcript_segment_ids = Column(JSON, nullable=False, default=list)
    text = Column(Text, nullable=False)
    start_time = Column(Float, nullable=False, default=0.0)
    end_time = Column(Float, nullable=False, default=0.0)
    embedding = Column(JSON, nullable=False)  # List of floats for cross-database vector compatibility
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    meeting = relationship("Meeting", back_populates="embeddings")

Index("idx_embeddings_meeting_time", EmbeddingChunk.meeting_id, EmbeddingChunk.start_time)
