import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import PatientActionBar from '../../components/patient/PatientActionBar.vue'
import PatientCard from '../../components/patient/PatientCard.vue'
import PatientPageShell from '../../components/patient/PatientPageShell.vue'
import PatientStageHeader from '../../components/patient/PatientStageHeader.vue'
import PatientStatusCard from '../../components/patient/PatientStatusCard.vue'
import PatientTipCard from '../../components/patient/PatientTipCard.vue'

describe('patient page shell components', () => {
  it('renders shell header card and action content with patient classes', () => {
    const wrapper = mount(PatientPageShell, {
      slots: {
        header: mount(PatientStageHeader, {
          props: {
            eyebrow: '开始问诊',
            title: '欢迎体验舌诊分析',
            description: '请先阅读说明后开始采集。',
          },
        }).html(),
        default: mount(PatientCard, {
          props: { title: '采集说明', variant: 'highlight' },
          slots: { default: '<p>body</p>' },
        }).html(),
        actions: mount(PatientActionBar, {
          slots: {
            default:
              '<button class="primary">开始采集</button><button class="secondary">查看示例</button>',
          },
        }).html(),
      },
    })

    expect(wrapper.find('.patient-page-shell').exists()).toBe(true)
    expect(wrapper.find('.patient-stage-header').exists()).toBe(true)
    expect(wrapper.find('.patient-card').exists()).toBe(true)
    expect(wrapper.find('.patient-action-bar').exists()).toBe(true)
    expect(wrapper.text()).toContain('开始问诊')
    expect(wrapper.text()).toContain('body')
    expect(wrapper.text()).toContain('开始采集')
    expect(wrapper.text()).toContain('查看示例')
  })

  it('supports tip and status tone variants', () => {
    const warning = mount(PatientTipCard, {
      props: { tone: 'warning', title: '填写提醒' },
      slots: { default: 'tip copy' },
    })
    const error = mount(PatientStatusCard, {
      props: { tone: 'error', title: '分析暂未完成', description: '请返回上一页重试' },
    })

    expect(warning.classes()).toContain('tone-warning')
    expect(warning.text()).toContain('填写提醒')
    expect(error.classes()).toContain('tone-error')
    expect(error.text()).toContain('分析暂未完成')
    expect(error.text()).toContain('请返回上一页重试')
  })

  it('supports primary and secondary actions together in the action bar', () => {
    const wrapper = mount(PatientActionBar, {
      slots: {
        default:
          '<button class="primary">primary</button><button class="secondary">secondary</button>',
      },
    })

    expect(wrapper.find('.patient-action-bar').exists()).toBe(true)
    expect(wrapper.text()).toContain('primary')
    expect(wrapper.text()).toContain('secondary')
  })
})
