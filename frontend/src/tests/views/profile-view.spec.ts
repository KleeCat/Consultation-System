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

  it('shows grouped profile fields and keeps API behavior unchanged', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)

    const wrapper = mount(ProfileView, {
      global: {
        plugins: [pinia],
      },
    })

    expect(wrapper.text()).toContain('基础信息')
    expect(wrapper.text()).toContain('姓名')
    expect(wrapper.text()).toContain('性别')
    expect(wrapper.text()).toContain('年龄')
    expect(wrapper.text()).toContain('填写说明')
    expect(wrapper.text()).toContain('返回欢迎页')
  })

  it('shows inline validation when profile fields are incomplete or invalid', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)

    const wrapper = mount(ProfileView, {
      global: {
        plugins: [pinia],
      },
    })

    const inputs = wrapper.findAll('input')
    await inputs[1].setValue('0')
    await wrapper.get('button.primary').trigger('click')

    expect(wrapper.text()).toContain('请输入姓名')
    expect(wrapper.text()).toContain('年龄需在 1 到 120 岁之间')
    expect(createSession).not.toHaveBeenCalled()
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
    await wrapper.get('button.primary').trigger('click')
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

  it('shows unified submission failure feedback when profile submission fails', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    vi.mocked(createSession).mockRejectedValue(new Error('Request failed: 500'))

    const wrapper = mount(ProfileView, {
      global: {
        plugins: [pinia],
      },
    })

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('张三')
    await inputs[1].setValue('30')
    await wrapper.get('button.primary').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('提交失败')
    expect(wrapper.text()).toContain('Request failed: 500')
    expect(push).not.toHaveBeenCalled()
    expect(wrapper.get('button.primary').attributes('disabled')).toBeUndefined()
  })
})
