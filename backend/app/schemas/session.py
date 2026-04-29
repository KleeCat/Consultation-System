from pydantic import BaseModel, Field


class SessionCreateRequest(BaseModel):
    name: str = Field(min_length=1)
    gender: str = Field(min_length=1)
    age: int = Field(ge=1, le=120)


class SessionResponse(BaseModel):
    session_id: int
    patient_id: int
    name: str
    gender: str
    age: int
    session_status: str
