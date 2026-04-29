import { createPinia, setActivePinia } from 'pinia'
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { selectCapture, uploadCapture } from '../../api/consultation'
import { useConsultationStore } from '../../stores/consultation'
import CaptureConfirmView from '../../views/patient/CaptureConfirmView.vue'
import CaptureGuideView from '../../views/patient/CaptureGuideView.vue'
import CaptureView from '../../views/patient/CaptureView.vue'

const push = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push,
  }),
}))

vi.mock('../../api/consultation', () => ({
  uploadCapture: vi.fn(),
  selectCapture: vi.fn(),
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

describe('patient capture flow', () => {
  beforeEach(() => {
    push.mockReset()
    vi.mocked(uploadCapture).mockReset()
    vi.mocked(selectCapture).mockReset()
  })

  it('navigates from capture guide to capture confirm, supports retake, and continues to analyzing', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useConsultationStore()
    store.sessionId = 5

    vi.mocked(uploadCapture)
      .mockResolvedValueOnce({
        capture_id: 11,
        quality_status: 'good',
        image_path: '/uploads/capture-1.png',
      })
      .mockResolvedValueOnce({
        capture_id: 12,
        quality_status: 'poor',
        image_path: '/uploads/capture-2.png',
      })
    vi.mocked(selectCapture).mockResolvedValue({})

    const guideWrapper = mount(CaptureGuideView, {
      global: {
        plugins: [pinia],
      },
    })

    await guideWrapper.get('button.primary').trigger('click')

    const captureWrapper = mount(CaptureView, {
      global: {
        plugins: [pinia],
      },
    })

    await captureWrapper.get('button.emit-capture').trigger('click')
    await flushPromises()

    const confirmWrapper = mount(CaptureConfirmView, {
      global: {
        plugins: [pinia],
      },
    })

    await confirmWrapper.get('button.secondary').trigger('click')

    const retakeCaptureWrapper = mount(CaptureView, {
      global: {
        plugins: [pinia],
      },
    })

    await retakeCaptureWrapper.get('button.emit-capture').trigger('click')
    await flushPromises()

    const retakeConfirmWrapper = mount(CaptureConfirmView, {
      global: {
        plugins: [pinia],
      },
    })

    await retakeConfirmWrapper.get('button.primary').trigger('click')
    await flushPromises()

    expect(uploadCapture).toHaveBeenNthCalledWith(1, 5, 'camera-base64')
    expect(uploadCapture).toHaveBeenNthCalledWith(2, 5, 'camera-base64')
    expect(selectCapture).toHaveBeenCalledWith(5, 12)
    expect(push.mock.calls.map(([path]) => path)).toEqual([
      '/patient/capture',
      '/patient/capture-confirm',
      '/patient/capture',
      '/patient/capture-confirm',
      '/patient/analyzing',
    ])
    expect(store.latestCapture).toMatchObject({
      capture_id: 12,
      quality_status: 'poor',
      image_path: '/uploads/capture-2.png',
      image_base64: 'data:image/png;base64,camera-base64',
    })
    expect(store.status).toBe('tongue_confirmed')
  })
})
