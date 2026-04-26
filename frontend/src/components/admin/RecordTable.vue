<template>
  <table>
    <thead>
      <tr>
        <th>问诊时间</th>
        <th>患者</th>
        <th>状态</th>
        <th>主体质</th>
        <th>置信度</th>
        <th>风险</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="item in items"
        :key="item.session_id"
        @click="$emit('select', item)"
      >
        <td>{{ item.session_id }}</td>
        <td>{{ item.patient_name }}</td>
        <td>{{ item.session_status }}</td>
        <td>{{ item.primary_constitution }}</td>
        <td>{{ item.confidence_level }}</td>
        <td>{{ item.risk_level }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import type { AdminRecordItem } from '../../api/admin'

defineProps<{
  items: AdminRecordItem[]
}>()

defineEmits<{
  select: [item: AdminRecordItem]
}>()
</script>
