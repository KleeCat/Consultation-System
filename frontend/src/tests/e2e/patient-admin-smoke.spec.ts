import { createPinia, setActivePinia } from 'pinia'
import { mount, flushPromises } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import RecordListView from '../../views/admin/RecordListView.vue'
import ResultView from '../../views/patient/ResultView.vue'
import { useConsultationStore } from '../../stores/consultation'

vi.mock('../../api/admin', () => ({
  listAdminRecords: vi.fn().mockResolvedValue({
    items: [
      {
        session_id: 2,
        patient_name: '演示患者',
        session_status: 'completed',
        primary_constitution: 'yang_deficiency',
        confidence_level: 'medium',
        risk_level: 'low',
      },
    ],
  }),
}))

describe('patient admin smoke', () => {
  it('renders patient result and admin list from fixtures', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useConsultationStore()
    store.status = 'completed'
    store.result = {
      primary_constitution: 'yang_deficiency',
      confidence_level: 'medium',
      tongue_features: ['苔白'],
      report: {
        diet_advice: '少食生冷，适当温补。',
      },
    }

    const resultWrapper = mount(ResultView, {
      global: { plugins: [pinia] },
    })
    const adminWrapper = mount(RecordListView, {
      global: {
        stubs: {
          RouterLink: true,
        },
      },
    })

    await flushPromises()
    expect(resultWrapper.text()).toContain('置信度')
    expect(adminWrapper.text()).toContain('completed')
  })
})
