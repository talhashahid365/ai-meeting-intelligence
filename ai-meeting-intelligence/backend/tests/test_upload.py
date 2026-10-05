import io
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_upload_validation(client: AsyncClient, auth_headers):
    # 1. Invalid extension upload
    bad_file = io.BytesIO(b"fake executable code")
    files = {"file": ("malicious.exe", bad_file, "application/octet-stream")}
    resp = await client.post("/api/meetings/upload", files=files, headers=auth_headers)
    assert resp.status_code == 400
    assert "Unsupported file extension" in resp.json()["detail"]

    # 2. Valid audio upload (WAV)
    # A tiny valid RIFF WAV header (44 bytes)
    wav_header = (
        b"RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00"
        b"\x80>\x00\x00\x00}\x00\x00\x02\x00\x10\x00data\x00\x00\x00\x00"
    )
    audio_file = io.BytesIO(wav_header)
    files = {"file": ("test_audio.wav", audio_file, "audio/wav")}
    resp = await client.post("/api/meetings/upload", files=files, headers=auth_headers)
    assert resp.status_code == 202
    meeting = resp.json()
    assert meeting["media_type"] == "audio"
    assert meeting["processing_status"] in ["UPLOADED", "QUEUED", "PROCESSING", "COMPLETED"]

    # 3. Valid video upload (MP4)
    video_file = io.BytesIO(b"\x00\x00\x00\x18ftypmp42\x00\x00\x00\x00mp42isom")
    files = {"file": ("test_video.mp4", video_file, "video/mp4")}
    resp = await client.post("/api/meetings/upload", files=files, headers=auth_headers)
    assert resp.status_code == 202
    meeting = resp.json()
    assert meeting["media_type"] == "video"
