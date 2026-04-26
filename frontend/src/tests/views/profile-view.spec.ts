import { createPinia, setActivePinia } from 'pinia'
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createSession } from '../../api/consultation'
import { useConsultationStore } from '../../stores/consultation'
import ProfileView from '../../views/patient/ProfileView.vue'

const push = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push,
  }),
}))

vi.mock('../../api/consultation', () => ({
  createSession: vi.fn(),
}))

describe('profile view', () => {
  beforeEach(() => {
    push.mockReset()
    vi.mocked(createSession).mockReset()
  })

  it('creates session and routes to questionnaire', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    vi.mocked(createSession).mockResolvedValue({
      session_id: 12,
      patient_id: 3,
      name: '张三',
      gender: 'male',
      age: 35,
      session_status: 'profile_completed',
    })

    const wrapper = mount(ProfileView, {
      global: {
        plugins: [pinia],
      },
    })

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('张三')
    await inputs[1].setValue('35')
    await wrapper.get('select').setValue('male')
    await wrapper.get('button').trigger('click')
    await flushPromises()

    const store = useConsultationStore()
    expect(createSession).toHaveBeenCalledWith({
      name: '张三',
      gender: 'male',
      age: 35,
    })
    expect(store.sessionId).toBe(12)
    expect(store.status).toBe('profile_completed')
    expect(push).toHaveBeenCalledWith('/patient/questionnaire')
  })

  it('shows an error message when session creation fails', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    vi.mocked(createSession).mockRejectedValue(new Error('Request failed: 404'))

    const wrapper = mount(ProfileView, {
      global: {
        plugins: [pinia],
      },
    })

    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('提交失败：Request failed: 404')
    expect(push).not.toHaveBeenCalled()
    expect(wrapper.get('button').attributes('disabled')).toBeUndefined()
  })
})
