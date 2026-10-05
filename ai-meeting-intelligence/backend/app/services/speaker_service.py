from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.speaker import Speaker
from app.models.transcript import TranscriptSegment

class SpeakerService:
    @staticmethod
    async def process_speakers_and_transcript(
        db: AsyncSession,
        meeting_id: str,
        raw_segments: list[dict]
    ) -> list[TranscriptSegment]:
        """
        Create Speaker entities from transcription labels and insert timestamped TranscriptSegments.
        """
        # Track unique speakers: label -> Speaker object
        speaker_map: dict[str, Speaker] = {}
        
        # Collect distinct speaker labels
        for seg in raw_segments:
            label = seg.get("speaker") or "Speaker 1"
            if label not in speaker_map:
                speaker = Speaker(
                    meeting_id=meeting_id,
                    label=label,
                    display_name=label
                )
                db.add(speaker)
                speaker_map[label] = speaker

        await db.flush()  # assign IDs to speakers

        # Create TranscriptSegments
        transcript_segments = []
        for seg in raw_segments:
            label = seg.get("speaker") or "Speaker 1"
            speaker_obj = speaker_map.get(label)
            
            segment = TranscriptSegment(
                meeting_id=meeting_id,
                speaker_id=speaker_obj.id if speaker_obj else None,
                start_time=float(seg.get("start", 0.0)),
                end_time=float(seg.get("end", 0.0)),
                text=str(seg.get("text", "")).strip()
            )
            db.add(segment)
            transcript_segments.append(segment)

        await db.flush()
        return transcript_segments

    @staticmethod
    async def update_speaker_name(
        db: AsyncSession,
        meeting_id: str,
        speaker_id: str,
        new_display_name: str
    ) -> Speaker | None:
        stmt = select(Speaker).where(Speaker.id == speaker_id, Speaker.meeting_id == meeting_id)
        result = await db.execute(stmt)
        speaker = result.scalar_one_or_none()
        if speaker:
            speaker.display_name = new_display_name.strip()
            await db.commit()
            await db.refresh(speaker)
        return speaker
