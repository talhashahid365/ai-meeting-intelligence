import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_register_and_login(client: AsyncClient):
    # 1. Register
    reg_resp = await client.post(
        "/api/auth/register",
        json={"name": "Test User", "email": "newuser@test.com", "password": "securepassword123"}
    )
    assert reg_resp.status_code == 201
    reg_data = reg_resp.json()
    assert reg_data["email"] == "newuser@test.com"
    assert "password_hash" not in reg_data

    # 2. Duplicate registration
    dup_resp = await client.post(
        "/api/auth/register",
        json={"name": "Test User", "email": "newuser@test.com", "password": "securepassword123"}
    )
    assert dup_resp.status_code == 400

    # 3. Login success
    login_resp = await client.post(
        "/api/auth/login",
        json={"email": "newuser@test.com", "password": "securepassword123"}
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    assert len(token) > 20

    # 4. Login invalid password
    bad_login = await client.post(
        "/api/auth/login",
        json={"email": "newuser@test.com", "password": "wrongpassword"}
    )
    assert bad_login.status_code == 401

    # 5. Access /me protected route
    me_resp = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "newuser@test.com"

    # 6. Access /me with missing token
    unauth_resp = await client.get("/api/auth/me")
    assert unauth_resp.status_code == 403 or unauth_resp.status_code == 401
