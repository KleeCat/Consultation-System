import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import RecordTable from '../../components/admin/RecordTable.vue'

describe('record table', () => {
  it('emits select event when a row is clicked', async () => {
    const wrapper = mount(RecordTable, {
      props: {
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
      },
    })

    await wrapper.find('tbody tr').trigger('click')
    expect(wrapper.emitted('select')?.length).toBe(1)
  })
})
