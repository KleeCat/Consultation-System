import { beforeEach, describe, expect, it, vi } from 'vitest'

import { patientStages } from '../../constants/patientStages'

describe('patient stage metadata', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    delete document.body.dataset.appSurface
    window.history.pushState({}, '', '/')
  })

  it('defines stable stage copy for patient entry and result pages', () => {
    expect(patientStages.welcome.eyebrow).toBe('开始问诊')
    expect(patientStages.result.title).toContain('结果')
    expect(patientStages.finish.primaryActionLabel).toBe('返回首页')
  })

  it('wires the patient theme through runtime route changes', async () => {
    const app = {
      use: vi.fn(),
      mount: vi.fn(),
    }
    const afterEachHandlers: Array<(to: { path: string }) => void> = []
    const router = {
      afterEach: vi.fn((handler: (to: { path: string }) => void) => {
        afterEachHandlers.push(handler)
      }),
    }

    vi.doMock('vue', async (importOriginal) => {
      const actual = await importOriginal<typeof import('vue')>()
      return {
        ...actual,
        createApp: vi.fn(() => app),
      }
    })
    vi.doMock('pinia', () => ({
      createPinia: vi.fn(() => ({ __pinia: true })),
    }))
    vi.doMock('../../router', () => ({
      buildWebRouter: vi.fn(() => router),
    }))

    window.history.pushState({}, '', '/patient/welcome')

    await import('../../main')

    expect(document.body.dataset.appSurface).toBe('patient')
    expect(router.afterEach).toHaveBeenCalledTimes(1)

    afterEachHandlers[0]?.({ path: '/admin/login' })
    expect(document.body.dataset.appSurface).toBeUndefined()
  })
})
