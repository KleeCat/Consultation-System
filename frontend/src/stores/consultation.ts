import { defineStore } from 'pinia'

export const useConsultationStore = defineStore('consultation', {
  state: () => ({
    sessionId: null as number | null,
    status: 'welcome' as string,
    profile: {
      name: '',
      gender: 'female',
      age: 30,
    },
    questionnaireSummary: null as null | Record<string, number>,
    latestCapture: null as null | {
      capture_id: number
      quality_status: string
      image_base64?: string
      image_path?: string
    },
    result: null as null | {
      primary_constitution: string
      confidence_level: string
      tongue_features: string[]
      report: {
        diet_advice: string
        routine_advice?: string
        emotion_advice?: string
      }
    },
  }),
  getters: {
    canVisitResult: (state) => state.status === 'completed',
  },
  actions: {
    reset() {
      this.sessionId = null
      this.status = 'welcome'
      this.profile = {
        name: '',
        gender: 'female',
        age: 30,
      }
      this.questionnaireSummary = null
      this.latestCapture = null
      this.result = null
    },
  },
})
