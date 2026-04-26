import { defineStore } from 'pinia'

export const useConsultationStore = defineStore('consultation', {
  state: () => ({
    sessionId: null as number | null,
    status: 'welcome' as string,
    result: null as null | {
      primary_constitution: string
      confidence_level: string
      tongue_features: string[]
      report: {
        diet_advice: string
      }
    },
  }),
  getters: {
    canVisitResult: (state) => state.status === 'completed',
  },
})
