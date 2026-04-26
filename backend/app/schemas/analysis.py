from pydantic import BaseModel


class AnalysisResponse(BaseModel):
    session_id: int
    primary_constitution: str
    secondary_constitution: str | None = None
    confidence_level: str
    risk_level: str
    score_breakdown: dict[str, float]
    report: dict
