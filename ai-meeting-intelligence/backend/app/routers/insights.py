from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models.user import User
from app.models.meeting import Meeting
from app.models.insights import (
    MeetingInsight,
    KeyPoint,
    Decision,
    ActionItem,
    Deadline,
    UnresolvedIssue,
    FollowUpItem,
)
from app.schemas.insights import (
    MeetingSummaryResponse,
    KeyPointResponse,
    DecisionResponse,
    ActionItemResponse,
    ActionItemStatusUpdate,
    DeadlineResponse,
    UnresolvedIssueResponse,
    FollowUpItemResponse,
    FullMeetingIntelligenceResponse,
)
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/meetings", tags=["Meeting Insights"])

async def check_meeting_access(meeting_id: str, current_user: User, db: AsyncSession) -> Meeting:
    stmt = select(Meeting).where(Meeting.id == meeting_id)
    result = await db.execute(stmt)
    meeting = result.scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    if meeting.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return meeting

@router.get("/{meeting_id}/summary", response_model=MeetingSummaryResponse)
async def get_meeting_summary(
    meeting_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    meeting = await check_meeting_access(meeting_id, current_user, db)
    stmt = select(MeetingInsight).where(MeetingInsight.meeting_id == meeting_id)
    result = await db.execute(stmt)
    insight = result.scalar_one_or_none()

    if not insight:
        return MeetingSummaryResponse(
            meeting_id=meeting.id,
            meeting_title=meeting.title,
            executive_summary="Summary not yet generated.",
            detailed_summary="Detailed summary not yet generated.",
            sentiment_label="Neutral",
            sentiment_explanation="Awaiting analysis.",
            participants=[]
        )

    return MeetingSummaryResponse(
        meeting_id=meeting.id,
        meeting_title=meeting.title,
        executive_summary=insight.executive_summary,
        detailed_summary=insight.detailed_summary,
        sentiment_label=insight.sentiment_label,
        sentiment_explanation=insight.sentiment_explanation,
        participants=insight.participants or []
    )

@router.get("/{meeting_id}/decisions", response_model=list[DecisionResponse])
async def get_meeting_decisions(
    meeting_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await check_meeting_access(meeting_id, current_user, db)
    stmt = select(Decision).where(Decision.meeting_id == meeting_id).order_by(Decision.timestamp)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{meeting_id}/action-items", response_model=list[ActionItemResponse])
async def get_meeting_action_items(
    meeting_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await check_meeting_access(meeting_id, current_user, db)
    stmt = select(ActionItem).where(ActionItem.meeting_id == meeting_id).order_by(ActionItem.timestamp)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.patch("/{meeting_id}/action-items/{action_id}/status", response_model=ActionItemResponse)
async def update_action_item_status(
    meeting_id: str,
    action_id: str,
    body: ActionItemStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await check_meeting_access(meeting_id, current_user, db)
    stmt = select(ActionItem).where(ActionItem.id == action_id, ActionItem.meeting_id == meeting_id)
    result = await db.execute(stmt)
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")

    item.status = body.status
    await db.commit()
    await db.refresh(item)
    return item

@router.get("/{meeting_id}/deadlines", response_model=list[DeadlineResponse])
async def get_meeting_deadlines(
    meeting_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await check_meeting_access(meeting_id, current_user, db)
    stmt = select(Deadline).where(Deadline.meeting_id == meeting_id).order_by(Deadline.timestamp)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{meeting_id}/issues", response_model=list[UnresolvedIssueResponse])
async def get_meeting_issues(
    meeting_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await check_meeting_access(meeting_id, current_user, db)
    stmt = select(UnresolvedIssue).where(UnresolvedIssue.meeting_id == meeting_id).order_by(UnresolvedIssue.timestamp)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{meeting_id}/insights", response_model=FullMeetingIntelligenceResponse)
async def get_all_meeting_insights(
    meeting_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Consolidated endpoint returning summaries, decisions, action items, deadlines,
    unresolved issues, and follow-ups for the primary showcase UI.
    """
    meeting = await check_meeting_access(meeting_id, current_user, db)

    # 1. Summary
    insight_stmt = select(MeetingInsight).where(MeetingInsight.meeting_id == meeting_id)
    insight_res = await db.execute(insight_stmt)
    insight = insight_res.scalar_one_or_none()

    summary_resp = MeetingSummaryResponse(
        meeting_id=meeting.id,
        meeting_title=meeting.title,
        executive_summary=insight.executive_summary if insight else "Summary not yet generated.",
        detailed_summary=insight.detailed_summary if insight else "Detailed summary not yet generated.",
        sentiment_label=insight.sentiment_label if insight else "Neutral",
        sentiment_explanation=insight.sentiment_explanation if insight else "Awaiting analysis.",
        participants=insight.participants if insight else []
    )

    # 2. Key points
    kp_res = await db.execute(select(KeyPoint).where(KeyPoint.meeting_id == meeting_id).order_by(KeyPoint.timestamp))
    key_points = kp_res.scalars().all()

    # 3. Decisions
    dec_res = await db.execute(select(Decision).where(Decision.meeting_id == meeting_id).order_by(Decision.timestamp))
    decisions = dec_res.scalars().all()

    # 4. Action items
    ai_res = await db.execute(select(ActionItem).where(ActionItem.meeting_id == meeting_id).order_by(ActionItem.timestamp))
    action_items = ai_res.scalars().all()

    # 5. Deadlines
    dl_res = await db.execute(select(Deadline).where(Deadline.meeting_id == meeting_id).order_by(Deadline.timestamp))
    deadlines = dl_res.scalars().all()

    # 6. Unresolved issues
    ui_res = await db.execute(select(UnresolvedIssue).where(UnresolvedIssue.meeting_id == meeting_id).order_by(UnresolvedIssue.timestamp))
    unresolved_issues = ui_res.scalars().all()

    # 7. Follow-ups
    fu_res = await db.execute(select(FollowUpItem).where(FollowUpItem.meeting_id == meeting_id).order_by(FollowUpItem.timestamp))
    follow_up_items = fu_res.scalars().all()

    return FullMeetingIntelligenceResponse(
        summary=summary_resp,
        key_points=key_points,
        decisions=decisions,
        action_items=action_items,
        deadlines=deadlines,
        unresolved_issues=unresolved_issues,
        follow_up_items=follow_up_items
    )
