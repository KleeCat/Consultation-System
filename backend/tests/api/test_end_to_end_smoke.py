import base64
from io import BytesIO

from PIL import Image


def demo_answers():
    return [
        {"question_code": "fatigue_level", "answer_value": "slight_activity_tired"},
        {"question_code": "cold_hands_feet", "answer_value": "often_need_more_clothes"},
        {"question_code": "dry_mouth_throat", "answer_value": "occasional"},
        {"question_code": "body_heaviness", "answer_value": "frequent"},
        {"question_code": "appetite_after_meal", "answer_value": "average_appetite"},
        {"question_code": "mouth_taste", "answer_value": "sticky_mouth"},
        {"question_code": "stool_pattern", "answer_value": "loose"},
        {"question_code": "sleep_quality", "answer_value": "light_sleep"},
        {"question_code": "sweating_pattern", "answer_value": "sweat_after_activity"},
        {"question_code": "emotion_state", "answer_value": "occasionally_irritable"},
        {"question_code": "stress_response", "answer_value": "chest_tightness"},
        {"question_code": "sleep_schedule", "answer_value": "occasionally_late"},
        {"question_code": "activity_level", "answer_value": "sedentary_and_tired"},
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
