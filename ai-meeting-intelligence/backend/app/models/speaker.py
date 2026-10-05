import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.database import Base

class Speaker(Base):
    __tablename__ = "speakers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    label = Column(String(100), nullable=False)  # e.g., "Speaker 1"
    display_name = Column(String(100), nullable=False)  # e.g., "Ali" or "Speaker 1"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    meeting = relationship("Meeting", back_populates="speakers")
    transcript_segments = relationship("TranscriptSegment", back_populates="speaker")

Index("idx_speakers_meeting_label", Speaker.meeting_id, Speaker.label)
