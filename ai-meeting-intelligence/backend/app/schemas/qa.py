from datetime import datetime
from pydantic import BaseModel, Field

class QuestionRequest(BaseModel):
    question: str = Field(..., min_length=2, max_length=1000)

class SourceTimestamp(BaseModel):
    timestamp: float
    formatted_time: str
    text_snippet: str

class AnswerResponse(BaseModel):
    question: str
    answer: str
    sources: list[SourceTimestamp] = []
    meeting_id: str

class ChatMessageResponse(BaseModel):
    id: str
    role: str
    content: str
    source_timestamps: list[float] = []
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationHistoryResponse(BaseModel):
    conversation_id: str
    meeting_id: str
    messages: list[ChatMessageResponse] = []
