def format_timestamp(seconds: float) -> str:
    """Format seconds into MM:SS or HH:MM:SS string."""
    if seconds is None:
        return "00:00"
    
    total_seconds = int(round(seconds))
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    secs = total_seconds % 60
    
    if hours > 0:
        return f"{hours:02d}:{minutes:02d}:{secs:02d}"
    return f"{minutes:02d}:{secs:02d}"

def parse_timestamp(timestamp_str: str) -> float:
    """Parse MM:SS or HH:MM:SS string to seconds."""
    parts = timestamp_str.strip().split(":")
    if len(parts) == 2:
        return float(parts[0]) * 60 + float(parts[1])
    elif len(parts) == 3:
        return float(parts[0]) * 3600 + float(parts[1]) * 60 + float(parts[2])
    try:
        return float(timestamp_str)
    except ValueError:
        return 0.0
