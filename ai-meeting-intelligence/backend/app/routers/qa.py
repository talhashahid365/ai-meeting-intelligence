from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.user import User
from app.models.meeting import Meeting
from app.models.chat import AIConversation, AIMessage
from app.schemas.qa import QuestionRequest, AnswerResponse, ConversationHistoryResponse, ChatMessageResponse
from app.services.auth_service import get_current_user
from app.services.qa_service import QAService

router = APIRouter(prefix="/meetings", tags=["Meeting Q&A"])

@router.post("/{meeting_id}/ask", response_model=AnswerResponse)
async def ask_question(
    meeting_id: str,
    body: QuestionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Meeting).where(Meeting.id == meeting_id)
    result = await db.execute(stmt)
    meeting = result.scalar_one_or_none()

    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    if meeting.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden: You cannot access another user's meeting.")

    return await QAService.ask_meeting_question(
        db=db,
        user_id=current_user.id,
        meeting_id=meeting_id,
        question=body.question
    )

@router.get("/{meeting_id}/messages", response_model=ConversationHistoryResponse)
async def get_conversation_history(
    meeting_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Meeting).where(Meeting.id == meeting_id)
    result = await db.execute(stmt)
    meeting = result.scalar_one_or_none()

    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    if meeting.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    conv_stmt = (
        select(AIConversation)
        .where(AIConversation.meeting_id == meeting_id, AIConversation.user_id == current_user.id)
        .options(selectinload(AIConversation.messages))
    )
    conv_result = await db.execute(conv_stmt)
    conversation = conv_result.scalar_one_or_none()

    if not conversation:
        return ConversationHistoryResponse(
            conversation_id="",
            meeting_id=meeting_id,
            messages=[]
        )

    msg_items = [
        ChatMessageResponse(
            id=m.id,
            role=m.role,
            content=m.content,
            source_timestamps=m.source_timestamps or [],
            created_at=m.created_at
        )
        for m in conversation.messages
    ]

    return ConversationHistoryResponse(
        conversation_id=conversation.id,
        meeting_id=meeting_id,
        messages=msg_items
    )
