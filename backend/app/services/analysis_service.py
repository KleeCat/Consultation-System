import json
from dataclasses import dataclass

import numpy as np
from PIL import Image
from sqlmodel import Session

from backend.app.engines.advice_engine import build_advice
from backend.app.engines.confidence_engine import calculate_confidence
from backend.app.engines.fusion_engine import fuse_scores
from backend.app.engines.questionnaire_scorer import score_questionnaire
from backend.app.engines.risk_engine import calculate_risk
from backend.app.engines.tongue_feature_extractor import extract_tongue_features
from backend.app.models import ConstitutionResult, ResultReport, TongueFeature
from backend.app.repositories.result_repo import ResultRepository
from backend.app.services.report_service import ReportPayload


@dataclass
class AnalysisRunResult:
    session_id: int
    primary_constitution: str
    secondary_constitution: str | None
    confidence_level: str
    risk_level: str
    score_breakdown: dict[str, float]
    report: ReportPayload


class AnalysisService:
    def __init__(self, db: Session):
        self.repo = ResultRepository(db)

    def run(self, session_id: int) -> AnalysisRunResult:
        consultation_session = self.repo.get_session(session_id=session_id)
        answers = self.repo.get_answers(session_id=session_id)
        answer_map = {answer.question_code: answer.answer_value for answer in answers}
        questionnaire_scores = score_questionnaire(answer_map)

        capture = self.repo.get_selected_capture(session_id=session_id)
        image = Image.open(capture.image_path).convert("RGB")
        image_array = np.array(image)
        feature_data = extract_tongue_features(image_array)
        feature = self.repo.save_feature(
            TongueFeature(
                capture_id=capture.capture_id,
                tongue_color=str(feature_data["tongue_color"]),
                coating_color=str(feature_data["coating_color"]),
                coating_thickness=str(feature_data["coating_thickness"]),
                tooth_marks=bool(feature_data["tooth_marks"]),
                cracks=bool(feature_data["cracks"]),
                moisture_level=str(feature_data["moisture_level"]),
                feature_confidence=float(feature_data["feature_confidence"]),
            )
        )

        score_breakdown = fuse_scores(questionnaire_scores, feature_data)
        ranking = sorted(score_breakdown.items(), key=lambda item: item[1], reverse=True)
        primary_constitution = ranking[0][0]
        secondary_constitution = ranking[1][0] if len(ranking) > 1 else None
        confidence_level = calculate_confidence(score_breakdown, capture.quality_status)
        risk_level = calculate_risk(primary_constitution, capture.quality_status)
        advice = build_advice(primary_constitution)

        report = ReportPayload(
            summary_text=f"当前体质以 {primary_constitution} 倾向为主。",
            evidence_summary=f"问答与舌象共同提示 {primary_constitution} 倾向。",
            diet_advice=advice["diet_advice"],
            routine_advice=advice["routine_advice"],
            emotion_advice=advice["emotion_advice"],
            medical_reminder="如有持续不适，请进一步咨询医生。",
            display_payload={
                "diet_advice": advice["diet_advice"],
                "routine_advice": advice["routine_advice"],
                "emotion_advice": advice["emotion_advice"],
                "tongue_color": feature.tongue_color,
                "coating_color": feature.coating_color,
            },
        )

        saved_result = self.repo.save_result(
            ConstitutionResult(
                session_id=session_id,
                primary_constitution=primary_constitution,
                secondary_constitution=secondary_constitution,
                score_breakdown=json.dumps(score_breakdown, ensure_ascii=False),
                confidence_level=confidence_level,
                risk_level=risk_level,
                engine_version="v1",
            )
        )
        self.repo.save_report(
            ResultReport(
                session_id=session_id,
                summary_text=report.summary_text,
                evidence_summary=report.evidence_summary,
                diet_advice=report.diet_advice,
                routine_advice=report.routine_advice,
                emotion_advice=report.emotion_advice,
                medical_reminder=report.medical_reminder,
                display_payload=json.dumps(report.display_payload, ensure_ascii=False),
            )
        )
        self.repo.mark_session_completed(consultation_session, saved_result.result_id)

        return AnalysisRunResult(
            session_id=session_id,
            primary_constitution=primary_constitution,
            secondary_constitution=secondary_constitution,
            confidence_level=confidence_level,
            risk_level=risk_level,
            score_breakdown=score_breakdown,
            report=report,
        )
