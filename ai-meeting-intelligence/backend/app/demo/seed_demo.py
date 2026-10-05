import os
import sys
import math
import struct
import wave
import asyncio
from datetime import datetime, timezone
from sqlalchemy.future import select
from app.database import AsyncSessionLocal, init_db
from app.models.user import User
from app.models.meeting import Meeting
from app.models.file import File
from app.services.auth_service import hash_password
from app.services.pipeline_orchestrator import PipelineOrchestrator
from app.config import settings

def generate_sample_wav(file_path: str, duration_sec: int = 105):
    """
    Generate a clean multi-tone WAV audio file representing the meeting.
    Uses standard library wave module so no external tools are needed.
    """
    os.makedirs(os.path.dirname(os.path.abspath(file_path)), exist_ok=True)
    sample_rate = 16000
    n_samples = sample_rate * duration_sec

    with wave.open(file_path, "w") as wf:
        wf.setnchannels(1)  # Mono
        wf.setsampwidth(2)  # 16-bit
        wf.setframerate(sample_rate)

        tones = [300, 440, 550, 400]  # varying frequencies simulating speech bursts
        frames = bytearray()

        for i in range(n_samples):
            t = i / sample_rate
            segment_idx = int(t / 15) % len(tones)
            freq = tones[segment_idx]
            
            # Modulate amplitude so it sounds like speech cadences
            envelope = 0.5 + 0.5 * math.sin(2 * math.pi * 2.0 * t)
            if (int(t * 2) % 4) == 3:  # pauses between utterances
                value = 0
            else:
                value = int(8000 * envelope * math.sin(2 * math.pi * freq * t))

            frames.extend(struct.pack("<h", value))

        wf.writeframes(frames)
    print(f"Generated sample WAV audio file at {file_path}")

async def seed_data():
    await init_db()

    async with AsyncSessionLocal() as db:
        # 1. Create or get Demo User
        user_email = "demo@meetingintel.com"
        stmt = select(User).where(User.email == user_email)
        res = await db.execute(stmt)
        user = res.scalar_one_or_none()

        if not user:
            user = User(
                name="Alex Morgan",
                email=user_email,
                password_hash=hash_password("Demo123!")
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
            print(f"Created demo user: {user.email} (Password: Demo123!)")
        else:
            print(f"Demo user already exists: {user.email}")

        # 2. Check if demo meeting already exists
        m_stmt = select(Meeting).where(Meeting.user_id == user.id, Meeting.original_filename == "website_launch_meeting.wav")
        m_res = await db.execute(m_stmt)
        meeting = m_res.scalar_one_or_none()

        if not meeting or meeting.processing_status != "COMPLETED":
            if meeting:
                print(f"Reprocessing existing demo meeting {meeting.id}...")
                await PipelineOrchestrator.process_meeting(meeting.id)
            else:
                # Generate WAV file in uploads folder
                os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
                storage_key = "demo_website_launch_meeting.wav"
                file_path = os.path.join(settings.UPLOAD_DIR, storage_key)
                generate_sample_wav(file_path, duration_sec=105)

                meeting = Meeting(
                    user_id=user.id,
                    title="Website Launch Planning Meeting",
                    original_filename="website_launch_meeting.wav",
                    media_type="audio",
                    storage_url=f"/api/meetings/media/{storage_key}",
                    duration=105.0,
                    meeting_date=datetime(2026, 9, 20, 10, 0, tzinfo=timezone.utc),
                    processing_status="UPLOADED",
                    processing_progress=0
                )
                db.add(meeting)
                await db.commit()
                await db.refresh(meeting)

                db_file = File(
                    meeting_id=meeting.id,
                    file_path=file_path,
                    file_size=os.path.getsize(file_path),
                    mime_type="audio/wav",
                    storage_key=storage_key
                )
                db.add(db_file)
                await db.commit()

                print(f"Running pipeline for demo meeting {meeting.id}...")
                await PipelineOrchestrator.process_meeting(meeting.id)
            print("Demo meeting successfully processed with full intelligence!")
        else:
            print(f"Demo meeting already exists: {meeting.id} - Status: {meeting.processing_status}")

if __name__ == "__main__":
    asyncio.run(seed_data())
