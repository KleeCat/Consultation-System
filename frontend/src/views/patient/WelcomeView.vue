<template>
  <PatientPageShell>
    <template #header>
      <PatientStageHeader v-bind="patientStages.welcome" />
    </template>

    <PatientCard title="系统能力" variant="highlight">
      <p>系统会结合基础问答与舌象采集，生成本次体质判断与调理建议。</p>
    </PatientCard>

    <PatientTipCard tone="info" title="问诊流程">
      <ul class="welcome-list">
        <li>基础建档</li>
        <li>体质问答</li>
        <li>舌象采集</li>
        <li>智能分析与建议</li>
      </ul>
      <p>采集前请尽量保持光线充足，避免逆光。</p>
    </PatientTipCard>

    <template #actions>
      <PatientActionBar>
        <button class="primary" type="button" @click="startConsultation">开始问诊</button>
      </PatientActionBar>
    </template>
  </PatientPageShell>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

import PatientActionBar from '../../components/patient/PatientActionBar.vue'
import PatientCard from '../../components/patient/PatientCard.vue'
import PatientPageShell from '../../components/patient/PatientPageShell.vue'
import PatientStageHeader from '../../components/patient/PatientStageHeader.vue'
import PatientTipCard from '../../components/patient/PatientTipCard.vue'
import { patientStages } from '../../constants/patientStages'
import { useConsultationStore } from '../../stores/consultation'

const router = useRouter()
const store = useConsultationStore()

function startConsultation() {
  store.reset()
  router.push('/patient/profile')
}
</script>

<style scoped>
.welcome-list {
  margin: 0;
  padding-left: 1.25rem;
}

.welcome-list li + li {
  margin-top: 0.35rem;
}

.primary {
  min-height: 44px;
  padding: 0.85rem 1.4rem;
  border: none;
  border-radius: 999px;
  background: var(--patient-accent);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}
</style>
