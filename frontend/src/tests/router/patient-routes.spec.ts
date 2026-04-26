import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it } from 'vitest'

import { buildRouter } from '../../router'

describe('patient routes', () => {
  it('redirects to welcome when session is missing', async () => {
    setActivePinia(createPinia())
    const router = buildRouter()
    await router.push('/patient/questionnaire')
    expect(router.currentRoute.value.fullPath).toBe('/patient/welcome')
  })
})
