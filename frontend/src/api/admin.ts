import { httpGet } from './client'

export interface AdminRecordItem {
  session_id: number
  patient_name: string
  session_status: string
  primary_constitution: string | null
  confidence_level: string | null
  risk_level: string | null
}

export interface AdminRecordListResponse {
  items: AdminRecordItem[]
}

export async function listAdminRecords(): Promise<AdminRecordListResponse> {
  return httpGet<AdminRecordListResponse>('/api/admin/records')
}
