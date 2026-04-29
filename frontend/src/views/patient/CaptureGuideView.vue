<template>
  <PatientPageShell>
    <template #header>
      <PatientStageHeader v-bind="patientStages.captureGuide" />
    </template>

    <PatientCard title="采集前准备" variant="highlight">
      <p>请在进入拍摄页前确认环境与姿势，保证后续舌象图片清晰、稳定、便于识别。</p>
      <ul class="guide-list">
        <li>光线充足，优先选择自然光或稳定白光环境。</li>
        <li>舌面居中，拍摄时尽量让舌体完整出现在取景范围内。</li>
        <li>避免逆光，减少阴影、反光或背景过亮造成的干扰。</li>
      </ul>
    </PatientCard>

    <PatientTipCard tone="info" title="示例图与注意事项">
      <img class="guide-image" :src="demoTongueSample" alt="舌象采集示例图" />
      <p>保持镜头稳定，避免抖动或过度贴近。</p>
      <p>如首次拍摄不清晰，可返回后重新采集。</p>
    </PatientTipCard>

    <template #actions>
      <PatientActionBar>
        <button class="primary" type="button" @click="goCapture">开始采集</button>
      </PatientActionBar>
    </template>
  </PatientPageShell>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

import demoTongueSample from '../../assets/demo-tongue-sample.png'
import PatientActionBar from '../../components/patient/PatientActionBar.vue'
import PatientCard from '../../components/patient/PatientCard.vue'
import PatientPageShell from '../../components/patient/PatientPageShell.vue'
import PatientStageHeader from '../../components/patient/PatientStageHeader.vue'
import PatientTipCard from '../../components/patient/PatientTipCard.vue'
import { patientStages } from '../../constants/patientStages'

const router = useRouter()

function goCapture() {
  router.push('/patient/capture')
}
</script>

<style scoped>
.guide-list {
  margin: 0;
  padding-left: 1.25rem;
}

.guide-list li + li {
  margin-top: 0.5rem;
}

.guide-image {
  width: min(100%, 320px);
  border-radius: 18px;
  border: 1px solid rgba(181, 91, 109, 0.16);
  box-shadow: 0 10px 24px rgba(111, 59, 69, 0.08);
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
