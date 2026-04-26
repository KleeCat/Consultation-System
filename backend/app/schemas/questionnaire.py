from pydantic import BaseModel, Field


class QuestionnaireAnswerInput(BaseModel):
    question_code: str = Field(min_length=1)
    answer_value: str = Field(min_length=1)


class QuestionnaireSubmitRequest(BaseModel):
    answers: list[QuestionnaireAnswerInput]


class QuestionnaireSubmitResponse(BaseModel):
    session_id: int
    session_status: str
    summary: dict[str, float]
