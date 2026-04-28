import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import CameraPreview from '../../components/capture/CameraPreview.vue'

const playMock = vi.fn().mockResolvedValue(undefined)
const stopMock = vi.fn()
const drawImageMock = vi.fn()
const getUserMediaMock = vi.fn()
const toDataUrlMock = vi.fn(() => 'data:image/png;base64,camera-shot')

describe('camera preview', () => {
  beforeEach(() => {
    playMock.mockClear()
    stopMock.mockClear()
    drawImageMock.mockClear()
    getUserMediaMock.mockReset()
    toDataUrlMock.mockClear()

    Object.defineProperty(globalThis.HTMLMediaElement.prototype, 'srcObject', {
      configurable: true,
      writable: true,
      value: null,
    })
    Object.defineProperty(globalThis.HTMLMediaElement.prototype, 'play', {
      configurable: true,
      writable: true,
      value: playMock,
    })
    Object.defineProperty(globalThis.HTMLCanvasElement.prototype, 'getContext', {
      configurable: true,
      writable: true,
      value: vi.fn(() => ({ drawImage: drawImageMock })),
    })
    Object.defineProperty(globalThis.HTMLCanvasElement.prototype, 'toDataURL', {
      configurable: true,
      writable: true,
      value: toDataUrlMock,
    })
    Object.defineProperty(globalThis.navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: getUserMediaMock,
      },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('requests camera access and emits a captured frame', async () => {
    getUserMediaMock.mockResolvedValue({
      getTracks: () => [{ stop: stopMock }],
    })

    const wrapper = mount(CameraPreview)
    await flushPromises()

    expect(getUserMediaMock).toHaveBeenCalledWith(
      expect.objectContaining({
        audio: false,
      }),
    )

    const video = wrapper.get('video').element as HTMLVideoElement
    Object.defineProperty(video, 'videoWidth', { configurable: true, value: 640 })
    Object.defineProperty(video, 'videoHeight', { configurable: true, value: 640 })

    const captureButton = wrapper
      .findAll('button')
      .find((button) => button.text() === '拍照采集')

    expect(captureButton).toBeTruthy()
    await captureButton!.trigger('click')

    expect(drawImageMock).toHaveBeenCalled()
    expect(wrapper.emitted('captured')?.[0]).toEqual(['camera-shot'])
  })

  it('shows permission guidance when camera access is denied', async () => {
    getUserMediaMock.mockRejectedValue(Object.assign(new Error('denied'), { name: 'NotAllowedError' }))

    const wrapper = mount(CameraPreview)
    await flushPromises()

    expect(wrapper.text()).toContain('请允许摄像头权限后重试')
    expect(wrapper.text()).toContain('重新开启摄像头')
  })

  it('emits a non-trivial demo tongue image for fallback testing', async () => {
    getUserMediaMock.mockRejectedValue(Object.assign(new Error('camera unavailable'), { name: 'NotFoundError' }))

    const wrapper = mount(CameraPreview)
    await flushPromises()

    const demoButton = wrapper
      .findAll('button')
      .find((button) => button.text() === '使用示例舌象图片')

    expect(demoButton).toBeTruthy()
    await demoButton!.trigger('click')

    const payload = wrapper.emitted('captured')?.[0]?.[0]
    expect(typeof payload).toBe('string')
    expect((payload as string).length).toBeGreaterThan(1000)
  })
})
