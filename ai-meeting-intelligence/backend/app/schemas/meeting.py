from datetime import datetime
from pydantic import BaseModel, Field

class SpeakerResponse(BaseModel):
    id: str
    meeting_id: str
    label: str
    display_name: str
    created_at: datetime

    class Config:
        from_attributes = True

class SpeakerUpdate(BaseModel):
    display_name: str = Field(..., min_length=1, max_length=100)

class MeetingCreate(BaseModel):
    title: str | None = None
    original_filename: str
    media_type: str = "audio"
    meeting_date: datetime | None = None

class MeetingUpdate(BaseModel):
    title: str | None = None

class MeetingResponse(BaseModel):
    id: str
    user_id: str
    title: str
    original_filename: str
    media_type: str
    storage_url: str
    duration: float | None = 0.0
    meeting_date: datetime | None = None
    processing_status: str
    processing_progress: int
    error_message: str | None = None
    created_at: datetime
    updated_at: datetime
    speakers: list[SpeakerResponse] = []

    class Config:
        from_attributes = True

class MeetingStatusResponse(BaseModel):
    id: str
    processing_status: str
    processing_progress: int
    error_message: str | None = None
    duration: float | None = 0.0

class MeetingListResponse(BaseModel):
    items: list[MeetingResponse]
    total: int
