import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { patientStages } from '../../constants/patientStages'

describe('patient stage metadata', () => {
  it('defines stable stage copy for patient entry and result pages', () => {
    expect(patientStages.welcome.eyebrow).toBe('开始问诊')
    expect(patientStages.result.title).toContain('结果')
    expect(patientStages.finish.primaryActionLabel).toBe('返回首页')
  })

  it('wires the patient theme from the frontend entry', () => {
    const mainTs = readFileSync(resolve(__dirname, '../../main.ts'), 'utf8')
    expect(mainTs).toContain(`import './assets/patient-theme.css'`)
  })
})
