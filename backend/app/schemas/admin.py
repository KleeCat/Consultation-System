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


class AdminRecordDetailResponse(BaseModel):
    session_id: int
    patient_name: str
    session_status: str
    primary_constitution: str | None = None
    confidence_level: str | None = None
    risk_level: str | None = None
    tongue_color: str | None = None
    coating_color: str | None = None
    summary_text: str | None = None
