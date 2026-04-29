import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import CameraPreview from '../../components/capture/CameraPreview.vue'

const playMock = vi.fn().mockResolvedValue(undefined)
const stopMock = vi.fn()
const drawImageMock = vi.fn()
const getUserMediaMock = vi.fn()
const toDataUrlMock = vi.fn(() => 'data:image/png;base64,camera-shot')
const fileReaderReadAsDataUrlMock = vi.fn()
let fileReaderResult = 'data:image/jpeg;base64,upload-jpeg-bytes'

describe('camera preview', () => {
  beforeEach(() => {
    playMock.mockClear()
    stopMock.mockClear()
    drawImageMock.mockClear()
    getUserMediaMock.mockReset()
    toDataUrlMock.mockClear()
    fileReaderReadAsDataUrlMock.mockClear()
    fileReaderResult = 'data:image/jpeg;base64,upload-jpeg-bytes'

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

    class MockFileReader {
      result: string | ArrayBuffer | null = null
      onload: null | (() => void) = null

      readAsDataURL(file: Blob) {
        fileReaderReadAsDataUrlMock(file)
        this.result = fileReaderResult
        this.onload?.()
      }
    }

    Object.defineProperty(globalThis, 'FileReader', {
      configurable: true,
      writable: true,
      value: MockFileReader,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('requests camera access, shows patient-facing capture copy, and emits a captured frame', async () => {
    const mediaStream = {
      getTracks: () => [{ stop: stopMock }],
    }
    getUserMediaMock.mockResolvedValue(mediaStream)

    const wrapper = mount(CameraPreview)
    await flushPromises()

    expect(getUserMediaMock).toHaveBeenCalledWith(
      expect.objectContaining({
        audio: false,
      }),
    )

    expect(wrapper.text()).toContain('第四步：舌象采集')
    expect(wrapper.text()).toContain('请保持稳定')
    expect(wrapper.text()).toContain('使用示例舌象图片')

    const video = wrapper.get('video').element as HTMLVideoElement
    expect(video.srcObject).toBe(mediaStream)
    expect(playMock).toHaveBeenCalled()

    Object.defineProperty(video, 'videoWidth', { configurable: true, value: 640 })
    Object.defineProperty(video, 'videoHeight', { configurable: true, value: 640 })

    const captureButton = wrapper
      .findAll('button')
      .find((button) => button.text() === '拍照采集')

    expect(captureButton).toBeTruthy()
    await captureButton!.trigger('click')

    expect(drawImageMock).toHaveBeenCalled()
    expect(wrapper.emitted('captured')?.[0]).toEqual(['data:image/png;base64,camera-shot'])
  })

  it('shows permission guidance and lets the user retry camera authorization', async () => {
    getUserMediaMock
      .mockRejectedValueOnce(Object.assign(new Error('denied'), { name: 'NotAllowedError' }))
      .mockResolvedValueOnce({
        getTracks: () => [{ stop: stopMock }],
      })

    const wrapper = mount(CameraPreview)
    await flushPromises()

    expect(wrapper.text()).toContain('请允许摄像头权限后重试')
    expect(wrapper.text()).toContain('重新开启摄像头')

    const retryButton = wrapper
      .findAll('button')
      .find((button) => button.text() === '重新开启摄像头')

    expect(retryButton).toBeTruthy()
    await retryButton!.trigger('click')
    await flushPromises()

    expect(getUserMediaMock).toHaveBeenCalledTimes(2)
  })

  it('shows timeout guidance when camera startup keeps pending', async () => {
    vi.useFakeTimers()
    getUserMediaMock.mockImplementation(() => new Promise(() => {}))

    const wrapper = mount(CameraPreview)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('第四步：舌象采集')
    expect(wrapper.text()).toContain('请保持稳定')
    expect(wrapper.text()).toContain('正在连接摄像头，请稍候')

    await vi.advanceTimersByTimeAsync(8000)
    await flushPromises()

    expect(wrapper.text()).toContain('摄像头启动超时')
    const retryButton = wrapper
      .findAll('button')
      .find((button) => button.text() === '重新开启摄像头')

    expect(retryButton).toBeTruthy()
    expect(retryButton!.attributes('disabled')).toBeUndefined()
  })

  it('shows unavailable fallback guidance and emits a demo tongue image', async () => {
    getUserMediaMock.mockRejectedValue(Object.assign(new Error('camera unavailable'), { name: 'NotFoundError' }))

    const wrapper = mount(CameraPreview)
    await flushPromises()

    expect(wrapper.text()).toContain('未检测到可用摄像头，请上传本地照片或使用示例图继续测试')
    expect(wrapper.text()).toContain('使用示例舌象图片')

    const demoButton = wrapper
      .findAll('button')
      .find((button) => button.text() === '使用示例舌象图片')

    expect(demoButton).toBeTruthy()
    await demoButton!.trigger('click')

    const payload = wrapper.emitted('captured')?.[0]?.[0]
    expect(typeof payload).toBe('string')
    expect((payload as string).length).toBeGreaterThan(1000)
  })

  it('keeps the full jpeg data url when uploading a local file', async () => {
    getUserMediaMock.mockRejectedValue(Object.assign(new Error('camera unavailable'), { name: 'NotFoundError' }))

    const wrapper = mount(CameraPreview)
    await flushPromises()

    const file = new File(['jpeg-bytes'], 'tongue.jpg', { type: 'image/jpeg' })
    const input = wrapper.get('input[type="file"]')

    Object.defineProperty(input.element, 'files', {
      configurable: true,
      value: [file],
    })
    await input.trigger('change')

    expect(fileReaderReadAsDataUrlMock).toHaveBeenCalledWith(file)
    expect(wrapper.emitted('captured')?.at(-1)).toEqual(['data:image/jpeg;base64,upload-jpeg-bytes'])
  })
})
