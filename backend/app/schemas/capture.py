from pydantic import BaseModel, Field


class CaptureCreateRequest(BaseModel):
    image_base64: str = Field(min_length=1)


class CaptureResponse(BaseModel):
    capture_id: int
    session_id: int
    quality_status: str
    brightness_score: float
    blur_score: float
    position_score: float
    image_path: str


class CaptureSelectResponse(BaseModel):
    capture_id: int
    session_id: int
    is_selected: bool
