<template>
  <main>
    <h2>问诊结果</h2>
    <p>置信度：{{ store.result?.confidence_level ?? '未知' }}</p>
    <EvidenceCard>
      <ul>
        <li v-for="item in store.result?.tongue_features ?? []" :key="item">{{ item }}</li>
      </ul>
    </EvidenceCard>
    <AdviceCard>
      <p>{{ store.result?.report.diet_advice ?? '' }}</p>
    </AdviceCard>
  </main>
</template>

<script setup lang="ts">
import AdviceCard from '../../components/result/AdviceCard.vue'
import EvidenceCard from '../../components/result/EvidenceCard.vue'
import { useConsultationStore } from '../../stores/consultation'

const store = useConsultationStore()
</script>
