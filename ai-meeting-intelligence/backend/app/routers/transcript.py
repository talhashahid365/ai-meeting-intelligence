import re
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.user import User
from app.models.meeting import Meeting
from app.models.transcript import TranscriptSegment
from app.models.speaker import Speaker
from app.schemas.transcript import (
    TranscriptResponse,
    TranscriptSegmentResponse,
    TranscriptSearchResponse,
    TranscriptSearchMatch
)
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/meetings", tags=["Transcript"])

@router.get("/{meeting_id}/transcript", response_model=TranscriptResponse)
async def get_meeting_transcript(
    meeting_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Meeting).where(Meeting.id == meeting_id)
    result = await db.execute(stmt)
    meeting = result.scalar_one_or_none()

    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    if meeting.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    seg_stmt = (
        select(TranscriptSegment)
        .where(TranscriptSegment.meeting_id == meeting_id)
        .options(selectinload(TranscriptSegment.speaker))
        .order_by(TranscriptSegment.start_time)
    )
    seg_result = await db.execute(seg_stmt)
    segments = seg_result.scalars().all()

    items = []
    for s in segments:
        items.append(TranscriptSegmentResponse(
            id=s.id,
            meeting_id=s.meeting_id,
            speaker_id=s.speaker_id,
            speaker_label=s.speaker.label if s.speaker else "Speaker 1",
            speaker_display_name=s.speaker.display_name if s.speaker else "Speaker 1",
            start_time=s.start_time,
            end_time=s.end_time,
            text=s.text,
            created_at=s.created_at
        ))

    return TranscriptResponse(
        meeting_id=meeting_id,
        segments=items,
        total_segments=len(items)
    )

@router.get("/{meeting_id}/transcript/search", response_model=TranscriptSearchResponse)
async def search_transcript(
    meeting_id: str,
    query: str = Query(..., min_length=1),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Meeting).where(Meeting.id == meeting_id)
    result = await db.execute(stmt)
    meeting = result.scalar_one_or_none()

    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    if meeting.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    seg_stmt = (
        select(TranscriptSegment)
        .where(TranscriptSegment.meeting_id == meeting_id)
        .options(selectinload(TranscriptSegment.speaker))
        .order_by(TranscriptSegment.start_time)
    )
    seg_result = await db.execute(seg_stmt)
    segments = seg_result.scalars().all()

    q_lower = query.lower()
    matches = []
    for s in segments:
        if q_lower in s.text.lower():
            # Add HTML mark highlight for frontend display
            pattern = re.compile(re.escape(query), re.IGNORECASE)
            highlighted = pattern.sub(lambda m: f"<mark>{m.group(0)}</mark>", s.text)

            matches.append(TranscriptSearchMatch(
                segment_id=s.id,
                speaker_name=s.speaker.display_name if s.speaker else "Speaker 1",
                start_time=s.start_time,
                end_time=s.end_time,
                text=s.text,
                highlight=highlighted
            ))

    return TranscriptSearchResponse(
        meeting_id=meeting_id,
        query=query,
        matches=matches,
        total_matches=len(matches)
    )
