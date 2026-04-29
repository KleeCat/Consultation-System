from datetime import datetime
from pathlib import Path

from backend.app.core.config import CAPTURES_DIR


def save_capture_image(session_id: int, raw_bytes: bytes) -> Path:
    session_dir = CAPTURES_DIR / f"session-{session_id}"
    session_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S%f")
    image_path = session_dir / f"capture-{timestamp}.png"
    image_path.write_bytes(raw_bytes)
    return image_path
