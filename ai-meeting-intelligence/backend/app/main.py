from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.routers import (
    auth,
    meetings,
    upload,
    processing,
    transcript,
    insights,
    qa,
    search,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables & vector extensions
    await init_db()
    yield

app = FastAPI(
    title="AI Meeting Intelligence System API",
    description=(
        "Production-grade API for transforming unstructured audio/video meeting conversations "
        "into accurate, structured, searchable, and actionable business intelligence."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows Next.js frontend dev & docker
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router, prefix="/api")
app.include_router(meetings.router, prefix="/api")
app.include_router(upload.router, prefix="/api")
app.include_router(processing.router, prefix="/api")
app.include_router(transcript.router, prefix="/api")
app.include_router(insights.router, prefix="/api")
app.include_router(qa.router, prefix="/api")
app.include_router(search.router, prefix="/api")

@app.get("/")
async def root():
    return {
        "name": "AI Meeting Intelligence System API",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "provider": settings.AI_PROVIDER, "storage": settings.STORAGE_TYPE}
