from __future__ import annotations

from sqlmodel import Field, SQLModel


class Patient(SQLModel, table=True):
    patient_id: int | None = Field(default=None, primary_key=True)
    name: str
    gender: str
    age: int
