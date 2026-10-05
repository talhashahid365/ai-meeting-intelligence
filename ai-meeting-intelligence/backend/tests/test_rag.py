import pytest
from httpx import AsyncClient
from app.services.pipeline_orchestrator import PipelineOrchestrator

@pytest.mark.asyncio
async def test_rag_contextual_qa_and_isolation(client: AsyncClient, test_user, auth_headers, second_user_headers):
    # 1. Create and process a meeting
    create_resp = await client.post(
        "/api/meetings",
        json={"title": "Launch Planning", "original_filename": "meeting.mp4", "media_type": "video"},
        headers=auth_headers
    )
    meeting_id = create_resp.json()["id"]

    # Process meeting through orchestrator
    await PipelineOrchestrator.process_meeting(meeting_id)

    # 2. Ask question about database decision
    db_resp = await client.post(
        f"/api/meetings/{meeting_id}/ask",
        json={"question": "What database did we decide to use?"},
        headers=auth_headers
    )
    assert db_resp.status_code == 200
    answer_data = db_resp.json()
    assert "PostgreSQL" in answer_data["answer"]
    assert len(answer_data["sources"]) > 0
    assert answer_data["sources"][0]["timestamp"] > 0

    # 3. Ask question about homepage deadline
    hp_resp = await client.post(
        f"/api/meetings/{meeting_id}/ask",
        json={"question": "When will the homepage be completed and by who?"},
        headers=auth_headers
    )
    assert hp_resp.status_code == 200
    assert "Friday" in hp_resp.json()["answer"]

    # 4. Strict Refusal Test: Ask out-of-context question
    random_resp = await client.post(
        f"/api/meetings/{meeting_id}/ask",
        json={"question": "What is the capital city of France?"},
        headers=auth_headers
    )
    assert random_resp.status_code == 200
    assert "I couldn't find that information in this meeting." in random_resp.json()["answer"]

    # 5. Multi-Tenant Authorization check (Different user gets 403 Forbidden)
    forbidden_qa = await client.post(
        f"/api/meetings/{meeting_id}/ask",
        json={"question": "What database did we decide to use?"},
        headers=second_user_headers
    )
    assert forbidden_qa.status_code == 403
