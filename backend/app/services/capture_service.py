import base64
from io import BytesIO

import numpy as np
from PIL import Image
from sqlmodel import Session

from backend.app.models import TongueCapture
from backend.app.repositories.capture_repo import CaptureRepository
from backend.app.utils.image_quality import evaluate_image_quality
from backend.app.utils.image_storage import save_capture_image


class CaptureService:
    def __init__(self, db: Session):
        self.repo = CaptureRepository(db)

    def create_capture(self, session_id: int, image_base64: str) -> TongueCapture:
        raw_bytes = base64.b64decode(image_base64)
        image = Image.open(BytesIO(raw_bytes)).convert("RGB")
        image_array = np.array(image)
        quality = evaluate_image_quality(image_array)
        image_path = save_capture_image(session_id=session_id, raw_bytes=raw_bytes)

        capture = TongueCapture(
            session_id=session_id,
            image_path=str(image_path),
            preview_path=str(image_path),
            quality_status=quality["quality_status"],
            brightness_score=quality["brightness_score"],
            blur_score=quality["blur_score"],
            position_score=quality["position_score"],
        )
        return self.repo.save_capture(capture)

    def select_capture(self, session_id: int, capture_id: int) -> TongueCapture | None:
        return self.repo.select_capture(session_id=session_id, capture_id=capture_id)
