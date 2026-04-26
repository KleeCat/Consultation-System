from __future__ import annotations

from datetime import datetime, UTC
from typing import Optional

from sqlmodel import Field, SQLModel


class TongueFeature(SQLModel, table=True):
    feature_id: Optional[int] = Field(default=None, primary_key=True)
    capture_id: int = Field(foreign_key="tonguecapture.capture_id")
    tongue_color: Optional[str] = None
    coating_color: Optional[str] = None
    coating_thickness: Optional[str] = None
    tooth_marks: Optional[bool] = None
    cracks: Optional[bool] = None
    moisture_level: Optional[str] = None
    feature_confidence: float = 0
    annotated_image_path: Optional[str] = None
    extracted_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
