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


class QuestionnaireOptionResponse(BaseModel):
    value: str
    label: str
    description: str | None = None


class QuestionnaireQuestionResponse(BaseModel):
    question_code: str
    group_code: str
    question_text: str
    question_help: str | None = None
    required: bool
    question_type: str
    options: list[QuestionnaireOptionResponse]


class QuestionnaireGroupResponse(BaseModel):
    group_code: str
    group_title: str
    group_description: str


class QuestionnaireTemplateResponse(BaseModel):
    questionnaire_code: str
    version: str
    title: str
    description: str
    groups: list[QuestionnaireGroupResponse]
    questions: list[QuestionnaireQuestionResponse]
