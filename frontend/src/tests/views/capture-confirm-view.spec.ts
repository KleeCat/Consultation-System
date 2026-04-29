import { createPinia, setActivePinia } from 'pinia'
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { selectCapture } from '../../api/consultation'
import { useConsultationStore } from '../../stores/consultation'
import CaptureConfirmView from '../../views/patient/CaptureConfirmView.vue'

const push = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push,
  }),
}))

vi.mock('../../api/consultation', () => ({
  selectCapture: vi.fn(),
}))

function mountView() {
  const pinia = createPinia()
  setActivePinia(pinia)
  const store = useConsultationStore()
  store.sessionId = 3
  store.latestCapture = {
    capture_id: 8,
    quality_status: 'good',
    image_base64: 'data:image/png;base64,preview-bytes',
    image_path: '/uploads/capture.png',
  }

  const wrapper = mount(CaptureConfirmView, {
    global: {
      plugins: [pinia],
    },
  })

  return { wrapper, store }
}

describe('capture confirm view', () => {
  beforeEach(() => {
    push.mockReset()
    vi.mocked(selectCapture).mockReset()
  })

  it('renders the unified patient shell with the fifth-step upload confirmation copy', () => {
    const { wrapper } = mountView()

    expect(wrapper.find('.patient-page-shell').exists()).toBe(true)
    expect(wrapper.find('.patient-stage-header').exists()).toBe(true)
    expect(wrapper.find('.patient-card').exists()).toBe(true)
    expect(wrapper.find('.patient-tip-card').exists()).toBe(true)
    expect(wrapper.find('.patient-action-bar').exists()).toBe(true)
    expect(wrapper.text()).toContain('第五步：确认上传')
    expect(wrapper.text()).toContain('确认当前舌象图片')
  })

  it('selects the capture and routes to analyzing after confirmation succeeds', async () => {
    vi.mocked(selectCapture).mockResolvedValue({})

    const { wrapper, store } = mountView()

    await wrapper.get('button.primary').trigger('click')
    await flushPromises()

    expect(selectCapture).toHaveBeenCalledWith(3, 8)
    expect(store.status).toBe('tongue_confirmed')
    expect(push).toHaveBeenCalledWith('/patient/analyzing')
  })

  it('shows a retryable confirmation error and stays on the page when confirmation fails', async () => {
    vi.mocked(selectCapture).mockRejectedValue(new Error('Request failed: 500'))

    const { wrapper } = mountView()

    await wrapper.get('button.primary').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('确认失败')
    expect(wrapper.find('img[alt="capture preview"]').exists()).toBe(true)
    expect(push).not.toHaveBeenCalled()
  })

  it('keeps the preview visible and disables both actions while submitting', async () => {
    vi.mocked(selectCapture).mockImplementation(() => new Promise(() => {}))

    const { wrapper } = mountView()

    await wrapper.get('button.primary').trigger('click')
    await Promise.resolve()

    const buttons = wrapper.findAll('button')
    expect(wrapper.find('img[alt="capture preview"]').exists()).toBe(true)
    expect(buttons).toHaveLength(2)
    expect(buttons[0]?.attributes('disabled')).toBeDefined()
    expect(buttons[1]?.attributes('disabled')).toBeDefined()
    expect(push).not.toHaveBeenCalled()
  })

  it('routes back to capture when retaking the photo', async () => {
    const { wrapper } = mountView()

    await wrapper.get('button.secondary').trigger('click')

    expect(push).toHaveBeenCalledWith('/patient/capture')
  })

  it('allows retrying confirmation after a failure without losing the preview', async () => {
    vi.mocked(selectCapture)
      .mockRejectedValueOnce(new Error('Request failed: 500'))
      .mockResolvedValueOnce({})

    const { wrapper } = mountView()

    await wrapper.get('button.primary').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('确认失败')
    expect(wrapper.find('img[alt="capture preview"]').exists()).toBe(true)
    expect(push).not.toHaveBeenCalled()

    await wrapper.get('button.primary').trigger('click')
    await flushPromises()

    expect(selectCapture).toHaveBeenCalledTimes(2)
    expect(push).toHaveBeenCalledWith('/patient/analyzing')
    expect(wrapper.find('img[alt="capture preview"]').exists()).toBe(true)
  })
})
