import base64
from io import BytesIO

from PIL import Image


def demo_answers():
    return [
        {"question_code": "fatigue_level", "answer_value": "often"},
        {"question_code": "cold_hands_feet", "answer_value": "always"},
    ]


def demo_image_b64() -> str:
    image = Image.new("RGB", (64, 64), color=(200, 170, 160))
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


def test_patient_flow_smoke(client):
    session = client.post(
        "/api/sessions",
        json={"name": "演示患者", "gender": "female", "age": 35},
    ).json()
    client.post(
        f"/api/sessions/{session['session_id']}/questionnaire",
        json={"answers": demo_answers()},
    )
    capture = client.post(
        f"/api/sessions/{session['session_id']}/captures",
        json={"image_base64": demo_image_b64()},
    ).json()
    client.post(
        f"/api/sessions/{session['session_id']}/captures/{capture['capture_id']}/select"
    )
    result = client.post(f"/api/sessions/{session['session_id']}/analyze").json()
    assert result["primary_constitution"]
