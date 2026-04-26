import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import CameraPreview from '../../components/capture/CameraPreview.vue'

describe('camera preview', () => {
  it('shows guidance message when camera stream is unavailable', async () => {
    const wrapper = mount(CameraPreview, {
      props: { streamError: 'permission_denied' },
    })
    expect(wrapper.text()).toContain('请允许摄像头权限')
  })

  it('emits a valid built-in demo image when clicking the demo button', async () => {
    const wrapper = mount(CameraPreview)

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('captured')?.[0]).toEqual([
      'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAgUlEQVR4nNXOMREAIBDAsFL/IphRgixE/MA1CrLu2ZRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMT5OzD1ACdUApJaXFJYAAAAAElFTkSuQmCC',
    ])
  })
})
