from pydantic import BaseModel


class AdminRecordItem(BaseModel):
    session_id: int
    patient_name: str
    session_status: str
    primary_constitution: str | None = None
    confidence_level: str | None = None
    risk_level: str | None = None


class AdminRecordListResponse(BaseModel):
    items: list[AdminRecordItem]
