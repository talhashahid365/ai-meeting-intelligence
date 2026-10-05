import pytest
from datetime import datetime
from app.ai.local_mock_provider import LocalMockAIProvider
from app.utils.date_parser import resolve_natural_date

@pytest.mark.asyncio
async def test_ai_analysis_schema_and_extraction():
    provider = LocalMockAIProvider()
    transcript = """
    [0.0s - 10.0s] Speaker 1: Welcome to our website launch planning meeting.
    [10.0s - 25.0s] Speaker 2: I will complete the homepage by Friday.
    [25.0s - 40.0s] Speaker 3: We decided to use PostgreSQL for the production database.
    [40.0s - 55.0s] Speaker 1: We haven't decided between Stripe and PayPal for payments.
    [55.0s - 70.0s] Speaker 2: Let's review the payment integration next Monday.
    """
    meeting_date_str = "2026-09-20T10:00:00"
    intel = await provider.analyze_transcript(transcript, meeting_date=meeting_date_str)

    # 1. Title
    assert "Website Launch" in intel.meeting_title

    # 2. Summaries
    assert len(intel.executive_summary) > 20
    assert len(intel.detailed_summary) > len(intel.executive_summary)

    # 3. Decisions
    assert any("PostgreSQL" in d.decision for d in intel.decisions)
    for d in intel.decisions:
        assert d.timestamp >= 0.0

    # 4. Action Items
    assert any(a.owner == "Ali" and "homepage" in a.task.lower() for a in intel.action_items)

    # 5. Deadlines & Date Resolution
    base_dt = datetime.fromisoformat(meeting_date_str)
    resolved_friday = resolve_natural_date("Friday", base_dt)
    assert resolved_friday is not None
    assert resolved_friday.startswith("2026-09-")

    # 6. Unresolved Issues
    assert any("Stripe" in ui.description or "PayPal" in ui.description for ui in intel.unresolved_issues)

    # 7. Follow-up items
    assert any("payment" in f.item.lower() for f in intel.follow_up_items)

    # 8. Sentiment
    assert intel.sentiment.label in ["Positive", "Neutral", "Mixed", "Negative"]
    assert len(intel.sentiment.explanation) > 10
