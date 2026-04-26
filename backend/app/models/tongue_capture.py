from __future__ import annotations

from datetime import datetime, UTC
from typing import Optional

from sqlmodel import Field, SQLModel


class TongueCapture(SQLModel, table=True):
    capture_id: Optional[int] = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="consultationsession.session_id")
    image_path: str
    preview_path: Optional[str] = None
    is_selected: bool = False
    quality_status: str = "pending"
    brightness_score: float = 0
    blur_score: float = 0
    position_score: float = 0
    captured_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
