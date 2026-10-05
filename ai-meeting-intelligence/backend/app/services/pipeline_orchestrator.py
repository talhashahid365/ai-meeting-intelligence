import os
import asyncio
import traceback
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.database import AsyncSessionLocal
from app.models.meeting import Meeting
from app.models.file import File
from app.services.media_service import MediaProcessingService
from app.services.transcription_service import TranscriptionService
from app.services.speaker_service import SpeakerService
from app.services.ai_analysis_service import AIAnalysisService
from app.services.vector_service import VectorService
from app.services.storage_service import get_storage_service

class PipelineOrchestrator:
    @classmethod
    async def process_meeting(cls, meeting_id: str):
        """
        Background worker pipeline executing the end-to-end intelligence extraction:
        UPLOADED -> QUEUED -> PROCESSING -> TRANSCRIBING -> IDENTIFYING_SPEAKERS -> ANALYZING -> INDEXING -> COMPLETED
        """
        async with AsyncSessionLocal() as db:
            stmt = select(Meeting).where(Meeting.id == meeting_id).options(selectinload(Meeting.files))
            result = await db.execute(stmt)
            meeting = result.scalar_one_or_none()
            if not meeting:
                return

            try:
                # 1. State: QUEUED
                meeting.processing_status = "QUEUED"
                meeting.processing_progress = 5
                await db.commit()
                await asyncio.sleep(0.5)

                # 2. State: PROCESSING (Media Processing & Audio Extraction)
                meeting.processing_status = "PROCESSING"
                meeting.processing_progress = 20
                await db.commit()

                storage_svc = get_storage_service()
                # Find stored file
                media_file = meeting.files[0] if meeting.files else None
                file_path = media_file.file_path if media_file else None
                
                if not file_path or not os.path.exists(file_path):
                    # In case of local relative path
                    if media_file:
                        file_path = storage_svc.get_file_path(media_file.storage_key)

                # Determine duration
                if file_path and os.path.exists(file_path):
                    duration = MediaProcessingService.get_media_duration(file_path)
                    meeting.duration = duration

                    # If video, extract audio to temporary wav file
                    if meeting.media_type == "video":
                        audio_output = os.path.splitext(file_path)[0] + "_extracted.wav"
                        audio_path = MediaProcessingService.extract_and_normalize_audio(file_path, audio_output)
                    else:
                        audio_path = file_path
                else:
                    audio_path = "demo_meeting.mp4"
                    meeting.duration = 105.0

                # 3. State: TRANSCRIBING
                meeting.processing_status = "TRANSCRIBING"
                meeting.processing_progress = 40
                await db.commit()

                raw_segments = await TranscriptionService.transcribe_audio(audio_path)

                # 4. State: IDENTIFYING_SPEAKERS
                meeting.processing_status = "IDENTIFYING_SPEAKERS"
                meeting.processing_progress = 60
                await db.commit()

                await SpeakerService.process_speakers_and_transcript(
                    db=db,
                    meeting_id=meeting.id,
                    raw_segments=raw_segments
                )
                await db.commit()

                # 5. State: ANALYZING (LLM Extraction of title, summaries, decisions, actions, etc.)
                meeting.processing_status = "ANALYZING"
                meeting.processing_progress = 80
                await db.commit()

                await AIAnalysisService.analyze_and_store_intelligence(
                    db=db,
                    meeting_id=meeting.id,
                    meeting_date=meeting.meeting_date
                )
                await db.commit()

                # 6. State: INDEXING (Vector embedding of transcript segments)
                meeting.processing_status = "INDEXING"
                meeting.processing_progress = 95
                await db.commit()

                await VectorService.index_meeting_transcript(
                    db=db,
                    meeting_id=meeting.id
                )
                await db.commit()

                # 7. State: COMPLETED
                meeting.processing_status = "COMPLETED"
                meeting.processing_progress = 100
                meeting.error_message = None
                await db.commit()

            except Exception as e:
                traceback.print_exc()
                meeting.processing_status = "FAILED"
                meeting.error_message = f"Processing error: {str(e)}"
                await db.commit()
