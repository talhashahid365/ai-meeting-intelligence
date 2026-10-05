from datetime import datetime
from pydantic import BaseModel

class SearchResultItem(BaseModel):
    meeting_id: str
    meeting_title: str
    meeting_date: datetime | None
    match_type: str  # title, summary, participant, decision, action_item, transcript
    matched_text: str
    timestamp: float | None = None

class GlobalSearchResponse(BaseModel):
    query: str
    results: list[SearchResultItem]
    total_results: int
