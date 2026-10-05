import re
import calendar
from datetime import datetime, timedelta, date

WEEKDAYS = {
    "monday": 0,
    "tuesday": 1,
    "wednesday": 2,
    "thursday": 3,
    "friday": 4,
    "saturday": 5,
    "sunday": 6
}

MONTHS = {
    "january": 1, "jan": 1,
    "february": 2, "feb": 2,
    "march": 3, "mar": 3,
    "april": 4, "apr": 4,
    "may": 5,
    "june": 6, "jun": 6,
    "july": 7, "jul": 7,
    "august": 8, "aug": 8,
    "september": 9, "sep": 9, "sept": 9,
    "october": 10, "oct": 10,
    "november": 11, "nov": 11,
    "december": 12, "dec": 12
}

def resolve_natural_date(expression: str, meeting_date: datetime | None = None) -> str | None:
    """
    Resolve natural language date expressions (e.g. 'Tomorrow', 'Friday', 'Next Monday', 
    'September 10', 'End of this month') into structured ISO date (YYYY-MM-DD)
    relative to the meeting date.
    
    If the date cannot be confidently resolved, returns None.
    """
    if not expression:
        return None
        
    expr = expression.strip().lower()
    base_dt = meeting_date or datetime.now()
    base_date = base_dt.date() if isinstance(base_dt, datetime) else base_dt

    # 1. "today"
    if re.search(r"\b(today|tonight)\b", expr):
        return base_date.isoformat()

    # 2. "tomorrow"
    if re.search(r"\btomorrow\b", expr):
        return (base_date + timedelta(days=1)).isoformat()

    # 3. "end of (this|the) month"
    if re.search(r"\bend of (this|the) month\b", expr):
        last_day = calendar.monthrange(base_date.year, base_date.month)[1]
        return date(base_date.year, base_date.month, last_day).isoformat()

    # 4. "next week"
    if re.search(r"\bnext week\b", expr):
        return (base_date + timedelta(days=7)).isoformat()

    # 5. "next [weekday]" or "this [weekday]" or simply "[weekday]" (e.g. "by Friday", "next Monday")
    for day_name, day_num in WEEKDAYS.items():
        if re.search(rf"\b(next\s+)?{day_name}\b", expr):
            current_day = base_date.weekday()
            days_ahead = (day_num - current_day) % 7
            if days_ahead == 0 or "next" in expr:
                days_ahead += 7
            return (base_date + timedelta(days=days_ahead)).isoformat()

    # 6. Specific month + day: e.g. "September 10", "Sep 10", "September 10th", "10 September"
    for month_name, month_num in MONTHS.items():
        # Match "Month Day" e.g. "September 10" or "September 10th"
        m1 = re.search(rf"\b{month_name}\s+(\d{{1,2}})(?:st|nd|rd|th)?(?:\s*,?\s*(\d{{4}}))?\b", expr)
        if m1:
            day = int(m1.group(1))
            year = int(m1.group(2)) if m1.group(2) else base_date.year
            try:
                return date(year, month_num, day).isoformat()
            except ValueError:
                pass
        
        # Match "Day Month" e.g. "10th of September" or "10 September"
        m2 = re.search(rf"\b(\d{{1,2}})(?:st|nd|rd|th)?(?:\s+of)?\s+{month_name}(?:\s*,?\s*(\d{{4}}))?\b", expr)
        if m2:
            day = int(m2.group(1))
            year = int(m2.group(2)) if m2.group(2) else base_date.year
            try:
                return date(year, month_num, day).isoformat()
            except ValueError:
                pass

    # 7. Exact ISO format: YYYY-MM-DD
    iso_match = re.search(r"\b(\d{4})-(\d{2})-(\d{2})\b", expr)
    if iso_match:
        return iso_match.group(0)

    # Could not confidently resolve, preserve original
    return None
