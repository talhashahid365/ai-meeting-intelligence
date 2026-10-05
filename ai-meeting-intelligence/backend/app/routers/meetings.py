import os
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func
from app.database import get_db
from app.models.user import User
from app.models.meeting import Meeting
from app.models.speaker import Speaker
from app.schemas.meeting import (
    MeetingCreate,
    MeetingResponse,
    MeetingListResponse,
    SpeakerUpdate,
    SpeakerResponse
)
from app.services.auth_service import get_current_user
from app.services.storage_service import get_storage_service

router = APIRouter(prefix="/meetings", tags=["Meetings"])

@router.post("", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED)
async def create_meeting(
    meeting_in: MeetingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    meeting = Meeting(
        user_id=current_user.id,
        title=meeting_in.title or "Untitled Meeting",
        original_filename=meeting_in.original_filename,
        media_type=meeting_in.media_type,
        storage_url="",
        meeting_date=meeting_in.meeting_date or datetime.now(timezone.utc),
        processing_status="UPLOADED",
        processing_progress=0
    )
    db.add(meeting)
    await db.commit()
    await db.refresh(meeting, attribute_names=["speakers"])
    return meeting

@router.get("", response_model=MeetingListResponse)
async def list_meetings(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Meeting)
        .where(Meeting.user_id == current_user.id)
        .options(selectinload(Meeting.speakers))
        .order_by(Meeting.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(stmt)
    meetings = result.scalars().all()

    count_stmt = select(func.count(Meeting.id)).where(Meeting.user_id == current_user.id)
    count_res = await db.execute(count_stmt)
    total = count_res.scalar() or 0

    return MeetingListResponse(items=meetings, total=total)

@router.get("/{meeting_id}", response_model=MeetingResponse)
async def get_meeting(
    meeting_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Meeting)
        .where(Meeting.id == meeting_id)
        .options(selectinload(Meeting.speakers))
    )
    result = await db.execute(stmt)
    meeting = result.scalar_one_or_none()

    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    if meeting.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to access this meeting")

    return meeting

@router.delete("/{meeting_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_meeting(
    meeting_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Meeting).where(Meeting.id == meeting_id).options(selectinload(Meeting.files))
    result = await db.execute(stmt)
    meeting = result.scalar_one_or_none()

    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    if meeting.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to delete this meeting")

    # Clean up physical files
    storage_svc = get_storage_service()
    for f in meeting.files:
        await storage_svc.delete_file(f.storage_key)

    await db.delete(meeting)
    await db.commit()
    return None

@router.patch("/{meeting_id}/speakers/{speaker_id}", response_model=SpeakerResponse)
async def update_speaker(
    meeting_id: str,
    speaker_id: str,
    body: SpeakerUpdate,
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

    spk_stmt = select(Speaker).where(Speaker.id == speaker_id, Speaker.meeting_id == meeting_id)
    spk_res = await db.execute(spk_stmt)
    speaker = spk_res.scalar_one_or_none()
    if not speaker:
        raise HTTPException(status_code=404, detail="Speaker not found")

    speaker.display_name = body.display_name.strip()
    await db.commit()
    await db.refresh(speaker)
    return speaker

@router.get("/media/{storage_key}")
async def get_media_file(storage_key: str):
    """Serve media files for in-browser playback."""
    storage_svc = get_storage_service()
    file_path = storage_svc.get_file_path(storage_key)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Media file not found")
    return FileResponse(file_path)
