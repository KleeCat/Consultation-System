from __future__ import annotations

from datetime import datetime, UTC
from sqlmodel import Field, SQLModel


class ConsultationSession(SQLModel, table=True):
    session_id: int | None = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patient.patient_id")
    session_status: str = Field(default="created")
    started_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    finished_at: datetime | None = None
    questionnaire_version: str | None = None
    rule_version: str | None = None
    selected_capture_id: int | None = None
    result_id: int | None = None
    failure_reason: str | None = None
