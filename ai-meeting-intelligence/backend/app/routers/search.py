from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.user import User
from app.models.meeting import Meeting
from app.models.insights import MeetingInsight, Decision, ActionItem
from app.models.transcript import TranscriptSegment
from app.schemas.search import GlobalSearchResponse, SearchResultItem
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/meetings", tags=["Search"])

@router.get("/search", response_model=GlobalSearchResponse)
async def search_meetings(
    q: str = Query(..., min_length=1),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query_str = q.strip().lower()
    results: list[SearchResultItem] = []

    # Get user meetings
    m_stmt = (
        select(Meeting)
        .where(Meeting.user_id == current_user.id)
        .options(
            selectinload(Meeting.insights),
            selectinload(Meeting.decisions),
            selectinload(Meeting.action_items),
            selectinload(Meeting.transcript_segments)
        )
    )
    res = await db.execute(m_stmt)
    meetings = res.scalars().all()

    for m in meetings:
        # 1. Match in meeting title
        if query_str in m.title.lower():
            results.append(SearchResultItem(
                meeting_id=m.id,
                meeting_title=m.title,
                meeting_date=m.meeting_date,
                match_type="title",
                matched_text=m.title,
                timestamp=0.0
            ))

        # 2. Match in summary or participants
        if m.insights:
            if query_str in m.insights.executive_summary.lower():
                snippet = m.insights.executive_summary[:160] + "..."
                results.append(SearchResultItem(
                    meeting_id=m.id,
                    meeting_title=m.title,
                    meeting_date=m.meeting_date,
                    match_type="executive_summary",
                    matched_text=snippet,
                    timestamp=0.0
                ))
            if query_str in m.insights.detailed_summary.lower():
                snippet = m.insights.detailed_summary[:160] + "..."
                results.append(SearchResultItem(
                    meeting_id=m.id,
                    meeting_title=m.title,
                    meeting_date=m.meeting_date,
                    match_type="detailed_summary",
                    matched_text=snippet,
                    timestamp=0.0
                ))
            for p in (m.insights.participants or []):
                if query_str in p.lower():
                    results.append(SearchResultItem(
                        meeting_id=m.id,
                        meeting_title=m.title,
                        meeting_date=m.meeting_date,
                        match_type="participant",
                        matched_text=f"Participant: {p}",
                        timestamp=0.0
                    ))

        # 3. Match in decisions
        for d in (m.decisions or []):
            if query_str in d.decision.lower():
                results.append(SearchResultItem(
                    meeting_id=m.id,
                    meeting_title=m.title,
                    meeting_date=m.meeting_date,
                    match_type="decision",
                    matched_text=d.decision,
                    timestamp=d.timestamp
                ))

        # 4. Match in action items
        for a in (m.action_items or []):
            if query_str in a.task.lower() or (a.owner and query_str in a.owner.lower()):
                results.append(SearchResultItem(
                    meeting_id=m.id,
                    meeting_title=m.title,
                    meeting_date=m.meeting_date,
                    match_type="action_item",
                    matched_text=f"{a.task} (Owner: {a.owner})",
                    timestamp=a.timestamp
                ))

        # 5. Match in transcript segments
        for seg in (m.transcript_segments or []):
            if query_str in seg.text.lower():
                results.append(SearchResultItem(
                    meeting_id=m.id,
                    meeting_title=m.title,
                    meeting_date=m.meeting_date,
                    match_type="transcript",
                    matched_text=seg.text[:160],
                    timestamp=seg.start_time
                ))
                # Only keep at most 2 transcript hits per meeting to prevent drowning
                if sum(1 for r in results if r.meeting_id == m.id and r.match_type == "transcript") >= 2:
                    break

    return GlobalSearchResponse(
        query=q,
        results=results,
        total_results=len(results)
    )
