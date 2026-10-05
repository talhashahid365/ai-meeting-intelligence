from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.ai.factory import get_ai_provider
from app.services.vector_service import VectorService
from app.utils.time_formatter import format_timestamp
from app.models.chat import AIConversation, AIMessage
from app.schemas.qa import AnswerResponse, SourceTimestamp

class QAService:
    @staticmethod
    async def ask_meeting_question(
        db: AsyncSession,
        user_id: str,
        meeting_id: str,
        question: str
    ) -> AnswerResponse:
        """
        Contextual RAG Q&A grounded strictly in the given meeting.
        """
        # 1. Retrieve top matching chunks strictly for this meeting
        retrieved_contexts = await VectorService.search_meeting_context(
            db=db,
            meeting_id=meeting_id,
            query=question,
            top_k=4
        )

        # 2. Get AI answer from provider
        ai_provider = get_ai_provider()
        qa_result = await ai_provider.answer_question(
            question=question,
            retrieved_contexts=retrieved_contexts
        )

        answer_text = qa_result.get("answer", "I couldn't find that information in this meeting.")
        source_ts_list = qa_result.get("source_timestamps", [])

        # Build formatted source objects
        sources: list[SourceTimestamp] = []
        for ts in source_ts_list:
            # Find matching context snippet
            snippet = ""
            for ctx in retrieved_contexts:
                if ctx["start_time"] <= ts <= ctx["end_time"] or abs(ctx["start_time"] - ts) < 5.0:
                    snippet = ctx["text"][:120] + "..."
                    break
            if not snippet and retrieved_contexts:
                snippet = retrieved_contexts[0]["text"][:120] + "..."

            sources.append(SourceTimestamp(
                timestamp=float(ts),
                formatted_time=format_timestamp(float(ts)),
                text_snippet=snippet
            ))

        # 3. Store conversation and message in database
        conv_stmt = select(AIConversation).where(
            AIConversation.meeting_id == meeting_id,
            AIConversation.user_id == user_id
        )
        conv_result = await db.execute(conv_stmt)
        conversation = conv_result.scalar_one_or_none()
        if not conversation:
            conversation = AIConversation(
                meeting_id=meeting_id,
                user_id=user_id
            )
            db.add(conversation)
            await db.flush()

        # Add user message
        db.add(AIMessage(
            conversation_id=conversation.id,
            role="user",
            content=question,
            source_timestamps=[]
        ))

        # Add assistant message
        db.add(AIMessage(
            conversation_id=conversation.id,
            role="assistant",
            content=answer_text,
            source_timestamps=[float(ts) for ts in source_ts_list]
        ))
        await db.commit()

        return AnswerResponse(
            question=question,
            answer=answer_text,
            sources=sources,
            meeting_id=meeting_id
        )
