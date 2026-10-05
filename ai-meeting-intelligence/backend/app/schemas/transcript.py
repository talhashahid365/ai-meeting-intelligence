from datetime import datetime
from pydantic import BaseModel

class TranscriptSegmentResponse(BaseModel):
    id: str
    meeting_id: str
    speaker_id: str | None = None
    speaker_label: str | None = None
    speaker_display_name: str | None = None
    start_time: float
    end_time: float
    text: str
    created_at: datetime

    class Config:
        from_attributes = True

class TranscriptResponse(BaseModel):
    meeting_id: str
    segments: list[TranscriptSegmentResponse]
    total_segments: int

class TranscriptSearchMatch(BaseModel):
    segment_id: str
    speaker_name: str
    start_time: float
    end_time: float
    text: str
    highlight: str

class TranscriptSearchResponse(BaseModel):
    meeting_id: str
    query: str
    matches: list[TranscriptSearchMatch]
    total_matches: int
