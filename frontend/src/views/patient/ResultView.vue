<template>
  <main>
    <h2>问诊结果</h2>
    <p>主要体质：{{ store.result?.primary_constitution ?? '未知' }}</p>
    <p>置信度：{{ store.result?.confidence_level ?? '未知' }}</p>
    <EvidenceCard>
      <ul>
        <li v-for="item in store.result?.tongue_features ?? []" :key="item">{{ item }}</li>
      </ul>
    </EvidenceCard>
    <AdviceCard>
      <p>{{ store.result?.report.diet_advice ?? '' }}</p>
      <p>{{ store.result?.report.routine_advice ?? '' }}</p>
      <p>{{ store.result?.report.emotion_advice ?? '' }}</p>
    </AdviceCard>
    <button @click="finishConsultation">完成</button>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

import AdviceCard from '../../components/result/AdviceCard.vue'
import EvidenceCard from '../../components/result/EvidenceCard.vue'
import { useConsultationStore } from '../../stores/consultation'

const router = useRouter()
const store = useConsultationStore()

function finishConsultation() {
  router.push('/patient/finish')
}
</script>
