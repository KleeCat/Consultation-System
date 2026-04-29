import { createPinia, setActivePinia } from 'pinia'
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { uploadCapture } from '../../api/consultation'
import { useConsultationStore } from '../../stores/consultation'
import CaptureView from '../../views/patient/CaptureView.vue'

const push = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push,
  }),
}))

vi.mock('../../api/consultation', () => ({
  uploadCapture: vi.fn(),
}))

vi.mock('../../components/capture/CameraPreview.vue', () => ({
  default: {
    props: ['busy'],
    template: `
      <div class="camera-preview-stub">
        <p>camera-busy: {{ busy ? 'yes' : 'no' }}</p>
        <button type="button" class="emit-capture" @click="$emit('captured', 'camera-base64')">
          emit-capture
        </button>
      </div>
    `,
  },
}))

describe('capture view', () => {
  beforeEach(() => {
    push.mockReset()
    vi.mocked(uploadCapture).mockReset()
  })

  it('renders the unified patient shell with camera card and back action', () => {
    const pinia = createPinia()
    setActivePinia(pinia)

    const wrapper = mount(CaptureView, {
      global: {
        plugins: [pinia],
      },
    })

    expect(wrapper.find('.patient-page-shell').exists()).toBe(true)
    expect(wrapper.text()).toContain('实时采集舌象图片')
    expect(wrapper.text()).toContain('摄像头')
    expect(wrapper.text()).toContain('返回采集准备')
  })

  it('shows uploading guidance while keeping the camera area rendered', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useConsultationStore()
    store.sessionId = 9

    let resolveUpload: ((value: {
      capture_id: number
      quality_status: string
      image_path: string
    }) => void) | null = null

    vi.mocked(uploadCapture).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveUpload = resolve
        }),
    )

    const wrapper = mount(CaptureView, {
      global: {
        plugins: [pinia],
      },
    })

    await wrapper.get('button.emit-capture').trigger('click')
    await flushPromises()

    expect(uploadCapture).toHaveBeenCalledWith(9, 'camera-base64')
    expect(wrapper.text()).toContain('请保持稳定，正在处理当前图像')
    expect(wrapper.find('.camera-preview-stub').exists()).toBe(true)
    expect(wrapper.text()).toContain('camera-busy: yes')

    resolveUpload?.({
      capture_id: 3,
      quality_status: 'good',
      image_path: '/uploads/capture.png',
    })
    await flushPromises()
  })

  it('routes back to the capture guide from the secondary action', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)

    const wrapper = mount(CaptureView, {
      global: {
        plugins: [pinia],
      },
    })

    await wrapper.get('button.secondary').trigger('click')

    expect(push).toHaveBeenCalledWith('/patient/capture-guide')
  })

  it('shows an error message when capture upload fails', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useConsultationStore()
    store.sessionId = 9

    vi.mocked(uploadCapture).mockRejectedValue(new Error('Request failed: 500'))

    const wrapper = mount(CaptureView, {
      global: {
        plugins: [pinia],
      },
    })

    await wrapper.get('button.emit-capture').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('上传失败')
    expect(wrapper.text()).toContain('Request failed: 500')
    expect(push).not.toHaveBeenCalled()
  })
})
