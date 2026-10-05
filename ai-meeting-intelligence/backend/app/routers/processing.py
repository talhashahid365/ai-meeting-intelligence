from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models.user import User
from app.models.meeting import Meeting
from app.schemas.meeting import MeetingStatusResponse
from app.services.auth_service import get_current_user
from app.services.pipeline_orchestrator import PipelineOrchestrator

router = APIRouter(prefix="/meetings", tags=["Processing Status"])

@router.get("/{meeting_id}/status", response_model=MeetingStatusResponse)
async def get_processing_status(
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

    return MeetingStatusResponse(
        id=meeting.id,
        processing_status=meeting.processing_status,
        processing_progress=meeting.processing_progress,
        error_message=meeting.error_message,
        duration=meeting.duration
    )

@router.post("/{meeting_id}/reprocess")
async def reprocess_meeting(
    meeting_id: str,
    background_tasks: BackgroundTasks,
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

    meeting.processing_status = "QUEUED"
    meeting.processing_progress = 5
    meeting.error_message = None
    await db.commit()

    background_tasks.add_task(PipelineOrchestrator.process_meeting, meeting.id)
    return {"message": "Reprocessing enqueued", "meeting_id": meeting.id}
