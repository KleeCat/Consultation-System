import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useConsultationStore } from '../../stores/consultation'
import CaptureGuideView from '../../views/patient/CaptureGuideView.vue'
import WelcomeView from '../../views/patient/WelcomeView.vue'

const push = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push,
  }),
}))

describe('welcome and capture guide views', () => {
  beforeEach(() => {
    push.mockReset()
  })

  it('resets consultation and routes from welcome to profile', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useConsultationStore()
    store.sessionId = 12
    store.status = 'completed'
    store.profile = {
      name: '张三',
      gender: 'male',
      age: 42,
    }

    const wrapper = mount(WelcomeView, {
      global: {
        plugins: [pinia],
      },
    })

    await wrapper.get('button.primary').trigger('click')

    expect(push).toHaveBeenCalledWith('/patient/profile')
    expect(store.sessionId).toBeNull()
    expect(store.status).toBe('welcome')
    expect(wrapper.text()).toContain('智能中医问诊系统')
    expect(wrapper.text()).toContain('问诊流程')
  })

  it('routes from capture guide to capture page with preparation tips visible', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)

    const wrapper = mount(CaptureGuideView, {
      global: {
        plugins: [pinia],
      },
    })

    expect(wrapper.text()).toContain('采集')
    expect(wrapper.find('img').exists()).toBe(true)
    expect(wrapper.text()).toContain('光线充足')
    expect(wrapper.text()).toContain('舌面居中')
    expect(wrapper.text()).toContain('避免逆光')

    await wrapper.get('button.primary').trigger('click')

    expect(push).toHaveBeenCalledWith('/patient/capture')
  })
})
