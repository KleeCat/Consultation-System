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
    template: '<button @click="$emit(\'captured\', \'camera-base64\')">emit-capture</button>',
  },
}))

describe('capture view', () => {
  beforeEach(() => {
    push.mockReset()
    vi.mocked(uploadCapture).mockReset()
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

    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('上传失败：Request failed: 500')
    expect(push).not.toHaveBeenCalled()
  })
})
