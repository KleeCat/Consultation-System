import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import PatientLayout from '../../layouts/PatientLayout.vue'

describe('patient layout', () => {
  it('keeps patient layout as a pure route container without legacy step text', () => {
    const wrapper = mount(PatientLayout, {
      global: {
        stubs: {
          RouterView: { template: '<div class="route-stub">route body</div>' },
        },
      },
    })

    expect(wrapper.find('.patient-layout').exists()).toBe(true)
    expect(wrapper.find('.route-stub').exists()).toBe(true)
    expect(wrapper.text()).toContain('route body')
    expect(wrapper.text()).not.toContain('当前流程')
  })
})
