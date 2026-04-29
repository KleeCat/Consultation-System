import { httpGet } from './client'

async function httpPost<T>(url: string, body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}

export interface SessionCreatePayload {
  name: string
  gender: string
  age: number
}

export interface SessionCreateResponse {
  session_id: number
  patient_id: number
  name: string
  gender: string
  age: number
  session_status: string
}

export interface QuestionnaireSubmitResponse {
  session_id: number
  session_status: string
  summary: Record<string, number>
}

export interface QuestionnaireOption {
  value: string
  label: string
  description?: string
}

export interface QuestionnaireQuestion {
  question_code: string
  group_code: string
  question_text: string
  question_help?: string
  required: boolean
  question_type: 'single_choice'
  options: QuestionnaireOption[]
}

export interface QuestionnaireGroup {
  group_code: string
  group_title: string
  group_description: string
}

export interface QuestionnaireTemplateResponse {
  questionnaire_code: string
  version: string
  title: string
  description: string
  groups: QuestionnaireGroup[]
  questions: QuestionnaireQuestion[]
}

export interface CaptureResponse {
  capture_id: number
  session_id: number
  quality_status: string
  brightness_score: number
  blur_score: number
  position_score: number
  image_path: string
}

export interface AnalyzeResponse {
  session_id: number
  primary_constitution: string
  secondary_constitution: string | null
  confidence_level: string
  risk_level: string
  score_breakdown: Record<string, number>
  report: Record<string, string>
}

export function createSession(payload: SessionCreatePayload) {
  return httpPost<SessionCreateResponse>('/api/sessions', payload)
}

export function getQuestionnaireTemplate() {
  return httpGet<QuestionnaireTemplateResponse>('/api/questionnaire/template')
}

export function submitQuestionnaire(
  sessionId: number,
  answers: Array<{ question_code: string; answer_value: string }>,
) {
  return httpPost<QuestionnaireSubmitResponse>(`/api/sessions/${sessionId}/questionnaire`, {
    answers,
  })
}

export function uploadCapture(sessionId: number, imageBase64: string) {
  return httpPost<CaptureResponse>(`/api/sessions/${sessionId}/captures`, {
    image_base64: imageBase64,
  })
}

export function selectCapture(sessionId: number, captureId: number) {
  return httpPost(`/api/sessions/${sessionId}/captures/${captureId}/select`)
}

export function analyzeSession(sessionId: number) {
  return httpPost<AnalyzeResponse>(`/api/sessions/${sessionId}/analyze`)
}

export function getAdminRecordDetail(sessionId: number) {
  return httpGet<{
    session_id: number
    patient_name: string
    session_status: string
    primary_constitution: string | null
    confidence_level: string | null
    risk_level: string | null
    tongue_color: string | null
    coating_color: string | null
    summary_text: string | null
  }>(`/api/admin/records/${sessionId}`)
}
