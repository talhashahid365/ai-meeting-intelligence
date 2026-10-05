import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Text, DateTime, ForeignKey, Index, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class MeetingInsight(Base):
    __tablename__ = "meeting_insights"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    executive_summary = Column(Text, nullable=False)
    detailed_summary = Column(Text, nullable=False)
    sentiment_label = Column(String(50), nullable=False)  # Positive, Neutral, Mixed, Negative
    sentiment_explanation = Column(Text, nullable=False)
    participants = Column(JSON, nullable=False, default=list)  # list of strings
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    meeting = relationship("Meeting", back_populates="insights")


class KeyPoint(Base):
    __tablename__ = "key_points"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    topic = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    timestamp = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    meeting = relationship("Meeting", back_populates="key_points")


class Decision(Base):
    __tablename__ = "decisions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    decision = Column(Text, nullable=False)
    timestamp = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    meeting = relationship("Meeting", back_populates="decisions")


class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    task = Column(Text, nullable=False)
    owner = Column(String(255), nullable=True, default="Unassigned")
    deadline = Column(String(255), nullable=True)
    status = Column(String(50), nullable=False, default="pending")  # pending, in_progress, completed
    timestamp = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    meeting = relationship("Meeting", back_populates="action_items")
    deadlines = relationship("Deadline", back_populates="action_item")


class Deadline(Base):
    __tablename__ = "deadlines"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    action_item_id = Column(String(36), ForeignKey("action_items.id", ondelete="SET NULL"), nullable=True)
    description = Column(Text, nullable=False)
    date = Column(String(100), nullable=True)  # resolved ISO date or formatted date string
    original_expression = Column(String(255), nullable=False)
    timestamp = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    meeting = relationship("Meeting", back_populates="deadlines")
    action_item = relationship("ActionItem", back_populates="deadlines")


class UnresolvedIssue(Base):
    __tablename__ = "unresolved_issues"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    issue = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    timestamp = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    meeting = relationship("Meeting", back_populates="unresolved_issues")


class FollowUpItem(Base):
    __tablename__ = "follow_up_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    item = Column(Text, nullable=False)
    timestamp = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    meeting = relationship("Meeting", back_populates="follow_up_items")
