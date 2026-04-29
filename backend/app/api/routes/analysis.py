from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from backend.app.core.database import get_session
from backend.app.schemas.analysis import AnalysisResponse
from backend.app.services.analysis_service import AnalysisService
from backend.app.services.session_service import SessionService


router = APIRouter(prefix="/api/sessions", tags=["analysis"])


@router.post("/{session_id}/analyze", response_model=AnalysisResponse)
def analyze_session(session_id: int, db: Session = Depends(get_session)) -> AnalysisResponse:
    session_service = SessionService(db)
    if session_service.get_session(session_id=session_id) is None:
        raise HTTPException(status_code=404, detail="Session not found")

    result = AnalysisService(db).run(session_id=session_id)
    return AnalysisResponse(
        session_id=result.session_id,
        primary_constitution=result.primary_constitution,
        secondary_constitution=result.secondary_constitution,
        confidence_level=result.confidence_level,
        risk_level=result.risk_level,
        score_breakdown=result.score_breakdown,
        report=result.report.display_payload,
    )
