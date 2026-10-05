# AI Meeting Intelligence System

> Transform unstructured meeting audio and video recordings into accurate, structured, searchable, and actionable business intelligence.

---

## 🌟 Overview

**AI Meeting Intelligence System** is an enterprise-grade web application designed to analyze meeting recordings and extract structured business outcomes. Unlike simple speech-to-text applications or generic chatbots, this platform executes an end-to-end multi-stage pipeline:

Audio/Video → Speech-to-Text → Speaker Diarization → LLM Analysis → Structured Intelligence + Vector Embedding → Grounded RAG Q&A with Clickable Timestamps.

---

## ✨ Key Features

1. **User Authentication & Isolation**
   - JWT-based authentication (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`).
   - Secure password hashing with `bcrypt`.
   - Strict multi-tenant user-level data isolation.

2. **Multi-Format Media Upload & Live Recorder**
   - Supports Audio (`MP3`, `WAV`, `M4A`, `AAC`, `OGG`) and Video (`MP4`, `MOV`, `AVI`, `MKV`, `WebM`).
   - Browser MediaRecorder integration to record meetings live directly from microphone/webcam.
   - Non-blocking asynchronous upload enqueuing.

3. **Multi-Stage Processing Pipeline**
   - Processing states: `UPLOADED` → `QUEUED` → `PROCESSING` → `TRANSCRIBING` → `IDENTIFYING_SPEAKERS` → `ANALYZING` → `INDEXING` → `COMPLETED`.
   - Real-time frontend status polling and progress animation.

4. **Structured AI Intelligence Extraction**
   - **Meeting Title Generation**: Automatically generates meaningful title from conversation content.
   - **Executive & Detailed Summaries**: Interactive short / detailed summary toggle.
   - **Participants**: Speaker identification and manual speaker renaming.
   - **Key Discussion Points**: Categorized topics with timestamps.
   - **Confirmed Decisions**: Distinguishes ideas/suggestions from confirmed decisions.
   - **Action Items & Task Owners**: Extracted task assignments with interactive status toggles (`pending`, `in_progress`, `completed`).
   - **Natural Language Deadline Resolution**: Converts expressions like *"next Monday"* into relative dates based on the meeting date.
   - **Unresolved Issues & Follow-Ups**: Tracks open topics and future action items.
   - **Meeting Sentiment Analysis**: Overall meeting sentiment with contextual explanation.

5. **Searchable Speaker-Separated Transcript**
   - Timestamped transcript segments.
   - Speaker diarization badges.
   - Interactive in-transcript search with match highlighting.

6. **Seekable Media Player & Timestamp System**
   - Click any extracted decision, action item, or transcript line to seek media playback to that exact second.

7. **Grounded Contextual RAG Q&A**
   - Ask AI assistant questions grounded strictly in the selected meeting.
   - Cosine similarity vector search over PostgreSQL / pgvector embeddings.
   - Provides supporting timestamp references.
   - Responds with *"I couldn't find that information in this meeting."* when query is outside meeting context to eliminate hallucinations.

8. **Global Search**
   - Search across meeting titles, summaries, transcripts, participants, decisions, and action items.

---

## 🏗 Technology Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0 (Async).
- **Database & Vectors**: PostgreSQL + `pgvector` (production), SQLite + `aiosqlite` (local dev).
- **AI Integration**: Multi-provider LLM abstraction supporting Gemini (`gemini-1.5-flash`), OpenAI (`gpt-4o-mini`), Anthropic (`claude-3-5-sonnet`), and Local Mock Provider.
- **Storage**: S3-compatible Object Storage abstraction (AWS S3, MinIO) and local filesystem storage.

---

## 🚀 Quick Start (Local Setup)

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# Activate virtualenv (Windows: venv\Scripts\activate | Unix: source venv/bin/activate)

pip install -r requirements.txt

# Run database migrations / seed sample demo data
python -m app.demo.seed_demo

# Start backend server
uvicorn app.main:app --reload --port 8000
```

Swagger API documentation will be available at: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend interface will be available at: `http://localhost:3000`

---

## 🧪 Testing

Execute backend test suite:

```bash
cd backend
python -m pytest
```

Tests cover Auth, Meetings CRUD, File Uploads, Transcription, AI Analysis, and Grounded Vector RAG Q&A.

---

## 🐳 Docker Support

Run full stack (Frontend, Backend FastAPI, PostgreSQL + pgvector) via Docker Compose:

```bash
docker-compose up --build
```

---

## 🔒 Demo Account Credentials

- **Email**: `demo@meetingintel.com`
- **Password**: `Demo123!`

---

## 📄 License

MIT License. Developed for AI Meeting Intelligence System.
