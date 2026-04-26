<template>
  <main>
    <h2>正在分析中</h2>
    <p>正在整理问答信息与舌象特征。</p>
  </main>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { analyzeSession } from '../../api/consultation'
import { useConsultationStore } from '../../stores/consultation'

const router = useRouter()
const store = useConsultationStore()

onMounted(async () => {
  if (!store.sessionId) {
    router.push('/patient/welcome')
    return
  }

  const response = await analyzeSession(store.sessionId)
  store.result = {
    primary_constitution: response.primary_constitution,
    confidence_level: response.confidence_level,
    tongue_features: [
      response.report.tongue_color ?? '舌象特征待补充',
      response.report.coating_color ?? '苔色待补充',
    ],
    report: {
      diet_advice: response.report.diet_advice ?? '',
      routine_advice: response.report.routine_advice ?? '',
      emotion_advice: response.report.emotion_advice ?? '',
    },
  }
  store.status = 'completed'
  router.push('/patient/result')
})
</script>
