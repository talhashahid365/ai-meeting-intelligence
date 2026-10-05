import os
import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.config import settings
from app.database import Base, get_db
import app.database as app_db
import app.services.pipeline_orchestrator as orch_module
from app.main import app
from app.models.user import User
from app.services.auth_service import hash_password, create_access_token

TEST_DB_FILE = "./test_meetings.db"
TEST_DATABASE_URL = f"sqlite+aiosqlite:///{TEST_DB_FILE}"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

TestAsyncSession = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# Point app database engine and sessionmaker to test database during test runs
app_db.engine = test_engine
app_db.AsyncSessionLocal = TestAsyncSession
orch_module.AsyncSessionLocal = TestAsyncSession

@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    settings.AI_PROVIDER = "mock"
    settings.STORAGE_TYPE = "local"
    yield
    # Cleanup file after session
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except Exception:
            pass

@pytest.fixture(autouse=True)
async def init_test_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

async def override_get_db():
    async with TestAsyncSession() as session:
        yield session

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c

@pytest.fixture
async def test_user():
    async with TestAsyncSession() as session:
        user = User(
            name="Alice Test",
            email="alice@test.com",
            password_hash=hash_password("Password123!")
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user

@pytest.fixture
async def second_user():
    async with TestAsyncSession() as session:
        user = User(
            name="Bob Stranger",
            email="bob@test.com",
            password_hash=hash_password("BobPassword123!")
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user

@pytest.fixture
def auth_headers(test_user):
    token = create_access_token(user_id=test_user.id, email=test_user.email)
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def second_user_headers(second_user):
    token = create_access_token(user_id=second_user.id, email=second_user.email)
    return {"Authorization": f"Bearer {token}"}
