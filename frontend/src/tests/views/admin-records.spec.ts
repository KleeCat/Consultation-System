import { mount, flushPromises } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import RecordListView from '../../views/admin/RecordListView.vue'

vi.mock('../../api/admin', () => ({
  listAdminRecords: vi.fn().mockResolvedValue({
    items: [
      {
        session_id: 1,
        patient_name: '张三',
        session_status: 'completed',
        primary_constitution: 'qi_deficiency',
        confidence_level: 'high',
        risk_level: 'low',
      },
    ],
  }),
}))

describe('admin records', () => {
  it('shows completed sessions in a table', async () => {
    const wrapper = mount(RecordListView)
    await flushPromises()
    expect(wrapper.text()).toContain('问诊时间')
    expect(wrapper.text()).toContain('completed')
  })
})
