import pytest
from app.services.transcription_service import TranscriptionService

@pytest.mark.asyncio
async def test_transcription_structure_and_timestamps():
    segments = await TranscriptionService.transcribe_audio("dummy_path.wav")
    assert len(segments) > 0

    for seg in segments:
        assert "start" in seg
        assert "end" in seg
        assert "speaker" in seg
        assert "text" in seg
        assert seg["end"] >= seg["start"]
        assert len(seg["text"]) > 0
        assert seg["speaker"].startswith("Speaker") or len(seg["speaker"]) > 0
