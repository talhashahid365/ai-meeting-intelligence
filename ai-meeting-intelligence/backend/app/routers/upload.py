import asyncio
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models.user import User
from app.models.meeting import Meeting
from app.models.file import File as DBFile
from app.schemas.meeting import MeetingResponse
from app.services.auth_service import get_current_user
from app.services.storage_service import get_storage_service
from app.services.pipeline_orchestrator import PipelineOrchestrator

router = APIRouter(prefix="/meetings", tags=["Meeting Upload"])

@router.post("/upload", response_model=MeetingResponse, status_code=status.HTTP_202_ACCEPTED)
async def upload_and_create_meeting(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Direct upload endpoint:
    1. Validates file and saves to storage
    2. Creates Meeting and File records in database
    3. Triggers background intelligence pipeline immediately
    4. Returns meeting ID and UPLOADED/QUEUED status without blocking
    """
    storage_svc = get_storage_service()
    
    # Create preliminary meeting record
    filename = file.filename or "recording.mp4"
    meeting = Meeting(
        user_id=current_user.id,
        title=filename.rsplit(".", 1)[0].replace("_", " ").replace("-", " ").title(),
        original_filename=filename,
        media_type="audio",  # will update after saving
        storage_url="",
        meeting_date=datetime.now(timezone.utc),
        processing_status="UPLOADED",
        processing_progress=0
    )
    db.add(meeting)
    await db.commit()
    await db.refresh(meeting)

    try:
        # Save file to storage
        saved_file_info = await storage_svc.save_file(file, meeting.id)
        
        # Update meeting metadata
        meeting.media_type = saved_file_info["media_type"]
        meeting.storage_url = saved_file_info["storage_url"]
        meeting.processing_status = "QUEUED"
        meeting.processing_progress = 5

        # Create DB File entry
        db_file = DBFile(
            meeting_id=meeting.id,
            file_path=saved_file_info["file_path"],
            file_size=saved_file_info["file_size"],
            mime_type=saved_file_info["mime_type"],
            storage_key=saved_file_info["storage_key"]
        )
        db.add(db_file)
        await db.commit()
        await db.refresh(meeting, attribute_names=["speakers"])

        # Enqueue background pipeline task
        background_tasks.add_task(PipelineOrchestrator.process_meeting, meeting.id)

        return meeting

    except Exception as e:
        meeting.processing_status = "FAILED"
        meeting.error_message = str(e)
        await db.commit()
        raise e

@router.post("/{meeting_id}/upload", response_model=MeetingResponse, status_code=status.HTTP_202_ACCEPTED)
async def upload_meeting_file(
    meeting_id: str,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
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

    storage_svc = get_storage_service()
    saved_file_info = await storage_svc.save_file(file, meeting.id)

    meeting.media_type = saved_file_info["media_type"]
    meeting.storage_url = saved_file_info["storage_url"]
    meeting.processing_status = "QUEUED"
    meeting.processing_progress = 5

    db_file = DBFile(
        meeting_id=meeting.id,
        file_path=saved_file_info["file_path"],
        file_size=saved_file_info["file_size"],
        mime_type=saved_file_info["mime_type"],
        storage_key=saved_file_info["storage_key"]
    )
    db.add(db_file)
    await db.commit()
    await db.refresh(meeting, attribute_names=["speakers"])

    background_tasks.add_task(PipelineOrchestrator.process_meeting, meeting.id)

    return meeting
