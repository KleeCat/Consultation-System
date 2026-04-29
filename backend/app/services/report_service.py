from dataclasses import dataclass


@dataclass
class ReportPayload:
    summary_text: str
    evidence_summary: str
    diet_advice: str
    routine_advice: str
    emotion_advice: str
    medical_reminder: str
    display_payload: dict
