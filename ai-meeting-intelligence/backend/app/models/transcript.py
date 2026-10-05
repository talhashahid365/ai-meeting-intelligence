import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.database import Base

class TranscriptSegment(Base):
    __tablename__ = "transcript_segments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    speaker_id = Column(String(36), ForeignKey("speakers.id", ondelete="SET NULL"), nullable=True, index=True)
    start_time = Column(Float, nullable=False, default=0.0)
    end_time = Column(Float, nullable=False, default=0.0)
    text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    meeting = relationship("Meeting", back_populates="transcript_segments")
    speaker = relationship("Speaker", back_populates="transcript_segments")

Index("idx_segments_meeting_time", TranscriptSegment.meeting_id, TranscriptSegment.start_time)
