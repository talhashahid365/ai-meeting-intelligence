from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.ai.factory import get_ai_provider
from app.models.meeting import Meeting
from app.models.insights import (
    MeetingInsight,
    KeyPoint,
    Decision,
    ActionItem,
    Deadline,
    UnresolvedIssue,
    FollowUpItem,
)
from app.models.transcript import TranscriptSegment
from app.models.speaker import Speaker
from app.schemas.insights import MeetingIntelligenceSchema

class AIAnalysisService:
    @staticmethod
    async def analyze_and_store_intelligence(
        db: AsyncSession,
        meeting_id: str,
        meeting_date: datetime | None = None
    ) -> MeetingIntelligenceSchema:
        """
        Extract structured intelligence using the AI provider and store in the database.
        """
        # Fetch segments with speakers
        stmt = (
            select(TranscriptSegment, Speaker.display_name)
            .outerjoin(Speaker, TranscriptSegment.speaker_id == Speaker.id)
            .where(TranscriptSegment.meeting_id == meeting_id)
            .order_by(TranscriptSegment.start_time)
        )
        result = await db.execute(stmt)
        rows = result.all()

        formatted_transcript_lines = []
        for segment, speaker_name in rows:
            name = speaker_name or "Speaker"
            formatted_transcript_lines.append(
                f"[{segment.start_time:.1f}s - {segment.end_time:.1f}s] {name}: {segment.text}"
            )
        full_transcript = "\n".join(formatted_transcript_lines)

        ai_provider = get_ai_provider()
        date_str = meeting_date.isoformat() if meeting_date else datetime.now().isoformat()
        intelligence: MeetingIntelligenceSchema = await ai_provider.analyze_transcript(
            full_transcript,
            meeting_date=date_str
        )

        # 1. Update Meeting title
        meeting_stmt = select(Meeting).where(Meeting.id == meeting_id)
        m_result = await db.execute(meeting_stmt)
        meeting = m_result.scalar_one_or_none()
        if meeting and intelligence.meeting_title:
            meeting.title = intelligence.meeting_title

        # 2. Store MeetingInsight (Summaries, sentiment, participants)
        insight = MeetingInsight(
            meeting_id=meeting_id,
            executive_summary=intelligence.executive_summary,
            detailed_summary=intelligence.detailed_summary,
            sentiment_label=intelligence.sentiment.label,
            sentiment_explanation=intelligence.sentiment.explanation,
            participants=intelligence.participants
        )
        db.add(insight)

        # 3. Store Key Points
        for kp in intelligence.key_points:
            db.add(KeyPoint(
                meeting_id=meeting_id,
                topic=kp.topic,
                description=kp.description,
                timestamp=kp.timestamp
            ))

        # 4. Store Decisions
        for dec in intelligence.decisions:
            db.add(Decision(
                meeting_id=meeting_id,
                decision=dec.decision,
                timestamp=dec.timestamp
            ))

        # 5. Store Action Items
        action_item_objs: list[ActionItem] = []
        for ai in intelligence.action_items:
            action_obj = ActionItem(
                meeting_id=meeting_id,
                task=ai.task,
                owner=ai.owner or "Unassigned",
                deadline=ai.deadline,
                status="pending",
                timestamp=ai.timestamp
            )
            db.add(action_obj)
            action_item_objs.append(action_obj)

        await db.flush()  # assign IDs to action items

        # 6. Store Deadlines and link to action items if matched
        for dl in intelligence.deadlines:
            linked_action_id = None
            for act in action_item_objs:
                # Match by timestamp or description keywords
                if abs(act.timestamp - dl.timestamp) < 5.0 or (act.deadline and act.deadline.lower() in dl.original_expression.lower()):
                    linked_action_id = act.id
                    break

            db.add(Deadline(
                meeting_id=meeting_id,
                action_item_id=linked_action_id,
                description=dl.description,
                date=dl.date,
                original_expression=dl.original_expression,
                timestamp=dl.timestamp
            ))

        # 7. Store Unresolved Issues
        for ui in intelligence.unresolved_issues:
            db.add(UnresolvedIssue(
                meeting_id=meeting_id,
                issue=ui.issue,
                description=ui.description,
                timestamp=ui.timestamp
            ))

        # 8. Store Follow-up Items
        for fu in intelligence.follow_up_items:
            db.add(FollowUpItem(
                meeting_id=meeting_id,
                item=fu.item,
                timestamp=fu.timestamp
            ))

        await db.flush()
        return intelligence
