<template>
  <main>
    <h2>记录详情</h2>
    <p>患者：{{ detail?.patient_name ?? '加载中' }}</p>
    <p>状态：{{ detail?.session_status ?? '-' }}</p>
    <p>体质：{{ detail?.primary_constitution ?? '-' }}</p>
    <p>舌色：{{ detail?.tongue_color ?? '-' }}</p>
    <p>苔色：{{ detail?.coating_color ?? '-' }}</p>
    <p>摘要：{{ detail?.summary_text ?? '-' }}</p>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { getAdminRecordDetail } from '../../api/consultation'

const route = useRoute()
const detail = ref<Awaited<ReturnType<typeof getAdminRecordDetail>> | null>(null)

onMounted(async () => {
  detail.value = await getAdminRecordDetail(Number(route.params.sessionId))
})
</script>
