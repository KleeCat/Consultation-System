from __future__ import annotations

from datetime import datetime, UTC
from typing import Optional

from sqlmodel import Field, SQLModel


class ConstitutionResult(SQLModel, table=True):
    result_id: Optional[int] = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="consultationsession.session_id")
    primary_constitution: Optional[str] = None
    secondary_constitution: Optional[str] = None
    score_breakdown: str = "{}"
    confidence_score: float = 0
    confidence_level: str = "low"
    risk_level: str = "low"
    risk_flags: str = "[]"
    engine_version: Optional[str] = None
    generated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
