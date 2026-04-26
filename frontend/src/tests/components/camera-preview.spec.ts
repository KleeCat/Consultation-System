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
})
