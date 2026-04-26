from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from backend.app.core.database import get_session
from backend.app.schemas.questionnaire import QuestionnaireSubmitRequest, QuestionnaireSubmitResponse
from backend.app.services.questionnaire_service import QuestionnaireService
from backend.app.services.session_service import SessionService


router = APIRouter(prefix="/api/sessions", tags=["questionnaire"])


@router.post("/{session_id}/questionnaire", response_model=QuestionnaireSubmitResponse)
def submit_questionnaire(
    session_id: int,
    payload: QuestionnaireSubmitRequest,
    db: Session = Depends(get_session),
) -> QuestionnaireSubmitResponse:
    session_service = SessionService(db)
    if session_service.get_session(session_id=session_id) is None:
        raise HTTPException(status_code=404, detail="Session not found")

    questionnaire_service = QuestionnaireService(db)
    session_status, summary = questionnaire_service.submit_answers(
        session_id=session_id,
        answers=payload.answers,
    )
    return QuestionnaireSubmitResponse(
        session_id=session_id,
        session_status=session_status,
        summary=summary,
    )
