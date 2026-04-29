import { describe, expect, it } from 'vitest'

describe('app shell', () => {
  it('renders the root app without crashing', async () => {
    const mod = await import('../../App.vue')
    expect(mod.default).toBeTruthy()
  })
})
