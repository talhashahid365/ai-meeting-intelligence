import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_meeting_crud_and_isolation(client: AsyncClient, test_user, auth_headers, second_user_headers):
    # 1. Create meeting
    create_resp = await client.post(
        "/api/meetings",
        json={"title": "Team Sync", "original_filename": "sync.mp4", "media_type": "video"},
        headers=auth_headers
    )
    assert create_resp.status_code == 201
    meeting = create_resp.json()
    meeting_id = meeting["id"]
    assert meeting["title"] == "Team Sync"
    assert meeting["processing_status"] == "UPLOADED"

    # 2. List meetings
    list_resp = await client.get("/api/meetings", headers=auth_headers)
    assert list_resp.status_code == 200
    items = list_resp.json()["items"]
    assert any(m["id"] == meeting_id for m in items)

    # 3. Retrieve meeting
    get_resp = await client.get(f"/api/meetings/{meeting_id}", headers=auth_headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == meeting_id

    # 4. Unauthorized access by a different authenticated user (Forbidden 403)
    forbidden_resp = await client.get(
        f"/api/meetings/{meeting_id}",
        headers=second_user_headers
    )
    assert forbidden_resp.status_code == 403

    # 5. Delete meeting
    del_resp = await client.delete(f"/api/meetings/{meeting_id}", headers=auth_headers)
    assert del_resp.status_code == 204

    # 6. Verify deleted
    verify_resp = await client.get(f"/api/meetings/{meeting_id}", headers=auth_headers)
    assert verify_resp.status_code == 404
