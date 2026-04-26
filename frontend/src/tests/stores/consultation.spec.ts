import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it } from 'vitest'

import { useConsultationStore } from '../../stores/consultation'

describe('consultation store', () => {
  it('blocks result route before analysis completes', () => {
    setActivePinia(createPinia())
    const store = useConsultationStore()
    store.status = 'questionnaire_completed'
    expect(store.canVisitResult).toBe(false)
  })
})
