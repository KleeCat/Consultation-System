import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { useConsultationStore } from '../../stores/consultation'
import ResultView from '../../views/patient/ResultView.vue'

describe('result view', () => {
  it('renders evidence tags and confidence label', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useConsultationStore()
    store.status = 'completed'
    store.result = {
      primary_constitution: 'qi_deficiency',
      confidence_level: 'high',
      tongue_features: ['舌色偏淡'],
      report: {
        diet_advice: '饮食以清淡温和为主。',
      },
    }

    const wrapper = mount(ResultView, {
      global: {
        plugins: [pinia],
      },
    })
    expect(wrapper.text()).toContain('置信度')
    expect(wrapper.text()).toContain('舌色偏淡')
  })
})
