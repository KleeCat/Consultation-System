from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from backend.app.core.database import get_session
from backend.app.schemas.questionnaire import (
    QuestionnaireSubmitRequest,
    QuestionnaireSubmitResponse,
    QuestionnaireTemplateResponse,
)
from backend.app.services.questionnaire_service import QuestionnaireService
from backend.app.services.session_service import SessionService


router = APIRouter(prefix="/api", tags=["questionnaire"])


@router.get("/questionnaire/template", response_model=QuestionnaireTemplateResponse)
def get_questionnaire_template(
    db: Session = Depends(get_session),
) -> QuestionnaireTemplateResponse:
    template = QuestionnaireService(db).get_template()
    return QuestionnaireTemplateResponse(**template)


@router.post("/sessions/{session_id}/questionnaire", response_model=QuestionnaireSubmitResponse)
def submit_questionnaire(
    session_id: int,
    payload: QuestionnaireSubmitRequest,
    db: Session = Depends(get_session),
) -> QuestionnaireSubmitResponse:
    session_service = SessionService(db)
    if session_service.get_session(session_id=session_id) is None:
        raise HTTPException(status_code=404, detail="Session not found")

    questionnaire_service = QuestionnaireService(db)
    try:
        session_status, summary = questionnaire_service.submit_answers(
            session_id=session_id,
            answers=payload.answers,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return QuestionnaireSubmitResponse(
        session_id=session_id,
        session_status=session_status,
        summary=summary,
    )
