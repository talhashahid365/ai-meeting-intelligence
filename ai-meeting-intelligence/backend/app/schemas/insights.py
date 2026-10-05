from datetime import datetime
from pydantic import BaseModel, Field

# --- LLM Extraction Input/Output Models (Strict Schema) ---

class LLMKeyPoint(BaseModel):
    topic: str = Field(..., description="High-level topic of the discussion point")
    description: str = Field(..., description="Concise explanation of what was discussed")
    timestamp: float = Field(..., description="Timestamp in seconds where this topic was discussed")

class LLMDecision(BaseModel):
    decision: str = Field(..., description="Explicit decision reached by the team")
    timestamp: float = Field(..., description="Timestamp in seconds where this decision was confirmed")

class LLMActionItem(BaseModel):
    task: str = Field(..., description="Specific actionable task to be completed")
    owner: str = Field("Unassigned", description="Name of the person assigned to the task")
    deadline: str | None = Field(None, description="Natural deadline mentioned (e.g., 'Friday', 'next Monday')")
    timestamp: float = Field(..., description="Timestamp in seconds where the task was assigned")

class LLMDeadline(BaseModel):
    description: str = Field(..., description="Description of the deadline event or milestone")
    date: str | None = Field(None, description="Resolved ISO date or formatted date (e.g. '2026-09-25')")
    original_expression: str = Field(..., description="Original natural expression from speech (e.g. 'by Friday')")
    timestamp: float = Field(..., description="Timestamp in seconds where this deadline was stated")

class LLMUnresolvedIssue(BaseModel):
    issue: str = Field(..., description="Brief title of the unresolved dilemma, blocker, or question")
    description: str = Field(..., description="Description of differing viewpoints or why it was not resolved")
    timestamp: float = Field(..., description="Timestamp in seconds where this issue was discussed")

class LLMFollowUpItem(BaseModel):
    item: str = Field(..., description="Follow-up action or event required in future")
    timestamp: float = Field(..., description="Timestamp in seconds where this was mentioned")

class LLMSentiment(BaseModel):
    label: str = Field(..., description="One of: Positive, Neutral, Mixed, Negative")
    explanation: str = Field(..., description="Short explanation for the sentiment based on conversation content")

class MeetingIntelligenceSchema(BaseModel):
    meeting_title: str = Field(..., description="Meaningful concise meeting title inferred from content")
    executive_summary: str = Field(..., description="High-level summary: why meeting happened, topics, outcomes, decisions")
    detailed_summary: str = Field(..., description="Comprehensive chronological or topic-based summary without hallucination")
    participants: list[str] = Field(default_factory=list, description="Names of identified participants")
    key_points: list[LLMKeyPoint] = Field(default_factory=list)
    decisions: list[LLMDecision] = Field(default_factory=list)
    action_items: list[LLMActionItem] = Field(default_factory=list)
    deadlines: list[LLMDeadline] = Field(default_factory=list)
    unresolved_issues: list[LLMUnresolvedIssue] = Field(default_factory=list)
    follow_up_items: list[LLMFollowUpItem] = Field(default_factory=list)
    sentiment: LLMSentiment


# --- API Response Models ---

class KeyPointResponse(BaseModel):
    id: str
    meeting_id: str
    topic: str
    description: str
    timestamp: float
    created_at: datetime

    class Config:
        from_attributes = True

class DecisionResponse(BaseModel):
    id: str
    meeting_id: str
    decision: str
    timestamp: float
    created_at: datetime

    class Config:
        from_attributes = True

class ActionItemResponse(BaseModel):
    id: str
    meeting_id: str
    task: str
    owner: str | None
    deadline: str | None
    status: str
    timestamp: float
    created_at: datetime

    class Config:
        from_attributes = True

class ActionItemStatusUpdate(BaseModel):
    status: str  # pending, in_progress, completed

class DeadlineResponse(BaseModel):
    id: str
    meeting_id: str
    action_item_id: str | None
    description: str
    date: str | None
    original_expression: str
    timestamp: float
    created_at: datetime

    class Config:
        from_attributes = True

class UnresolvedIssueResponse(BaseModel):
    id: str
    meeting_id: str
    issue: str
    description: str
    timestamp: float
    created_at: datetime

    class Config:
        from_attributes = True

class FollowUpItemResponse(BaseModel):
    id: str
    meeting_id: str
    item: str
    timestamp: float
    created_at: datetime

    class Config:
        from_attributes = True

class MeetingSummaryResponse(BaseModel):
    meeting_id: str
    meeting_title: str
    executive_summary: str
    detailed_summary: str
    sentiment_label: str
    sentiment_explanation: str
    participants: list[str]

class FullMeetingIntelligenceResponse(BaseModel):
    summary: MeetingSummaryResponse
    key_points: list[KeyPointResponse]
    decisions: list[DecisionResponse]
    action_items: list[ActionItemResponse]
    deadlines: list[DeadlineResponse]
    unresolved_issues: list[UnresolvedIssueResponse]
    follow_up_items: list[FollowUpItemResponse]
