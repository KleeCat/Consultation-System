from __future__ import annotations

from datetime import datetime, UTC
from typing import Optional

from sqlmodel import Field, SQLModel


class ResultReport(SQLModel, table=True):
    report_id: Optional[int] = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="consultationsession.session_id")
    summary_text: str = ""
    evidence_summary: str = ""
    diet_advice: str = ""
    routine_advice: str = ""
    emotion_advice: str = ""
    medical_reminder: str = ""
    display_payload: str = "{}"
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
