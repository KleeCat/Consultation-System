from __future__ import annotations

from datetime import datetime, UTC
from typing import Optional

from sqlmodel import Field, SQLModel


class QuestionnaireAnswer(SQLModel, table=True):
    answer_id: Optional[int] = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="consultationsession.session_id")
    question_code: str
    question_text_snapshot: str
    answer_value: str
    answer_label: str
    dimension_code: str
    score_contribution: float = 0
    answered_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
