import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Index, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    meeting = relationship("Meeting", back_populates="ai_conversations")
    user = relationship("User", back_populates="ai_conversations")
    messages = relationship("AIMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="AIMessage.created_at")


class AIMessage(Base):
    __tablename__ = "ai_messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String(36), ForeignKey("ai_conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(50), nullable=False)  # user or assistant
    content = Column(Text, nullable=False)
    source_timestamps = Column(JSON, nullable=True, default=list)  # List of float timestamps in seconds
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    conversation = relationship("AIConversation", back_populates="messages")
