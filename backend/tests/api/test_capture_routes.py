import base64
from io import BytesIO

from PIL import Image


def make_demo_image_base64() -> str:
    image = Image.new("RGB", (64, 64), color=(200, 170, 160))
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


def test_capture_route_saves_capture_and_returns_quality(client, session_id):
    response = client.post(
        f"/api/sessions/{session_id}/captures",
        json={"image_base64": make_demo_image_base64()},
    )
    body = response.json()
    assert response.status_code == 201
    assert body["quality_status"] in {"usable", "poor"}
    assert body["capture_id"] > 0
