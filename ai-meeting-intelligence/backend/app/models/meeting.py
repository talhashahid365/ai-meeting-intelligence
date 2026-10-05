import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from app.database import Base

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False, default="Untitled Meeting")
    original_filename = Column(String(255), nullable=False)
    media_type = Column(String(50), nullable=False)  # audio or video
    storage_url = Column(String(500), nullable=False)
    duration = Column(Float, nullable=True, default=0.0)  # in seconds
    meeting_date = Column(DateTime, nullable=True, default=lambda: datetime.now(timezone.utc))
    processing_status = Column(String(50), nullable=False, default="UPLOADED", index=True)
    processing_progress = Column(Integer, nullable=False, default=0)  # 0 - 100
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="meetings")
    files = relationship("File", back_populates="meeting", cascade="all, delete-orphan")
    speakers = relationship("Speaker", back_populates="meeting", cascade="all, delete-orphan")
    transcript_segments = relationship("TranscriptSegment", back_populates="meeting", cascade="all, delete-orphan", order_by="TranscriptSegment.start_time")
    insights = relationship("MeetingInsight", back_populates="meeting", uselist=False, cascade="all, delete-orphan")
    key_points = relationship("KeyPoint", back_populates="meeting", cascade="all, delete-orphan", order_by="KeyPoint.timestamp")
    decisions = relationship("Decision", back_populates="meeting", cascade="all, delete-orphan", order_by="Decision.timestamp")
    action_items = relationship("ActionItem", back_populates="meeting", cascade="all, delete-orphan", order_by="ActionItem.timestamp")
    deadlines = relationship("Deadline", back_populates="meeting", cascade="all, delete-orphan", order_by="Deadline.timestamp")
    unresolved_issues = relationship("UnresolvedIssue", back_populates="meeting", cascade="all, delete-orphan", order_by="UnresolvedIssue.timestamp")
    follow_up_items = relationship("FollowUpItem", back_populates="meeting", cascade="all, delete-orphan", order_by="FollowUpItem.timestamp")
    embeddings = relationship("EmbeddingChunk", back_populates="meeting", cascade="all, delete-orphan")
    ai_conversations = relationship("AIConversation", back_populates="meeting", cascade="all, delete-orphan")

Index("idx_meetings_user_created", Meeting.user_id, Meeting.created_at.desc())
