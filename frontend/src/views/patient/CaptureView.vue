<template>
  <PatientPageShell class="capture-view">
    <template #header>
      <PatientStageHeader v-bind="patientStages.capture" tone="highlight" />
    </template>

    <PatientCard class="capture-view__primary-card" title="摄像头" variant="highlight">
      <CameraPreview :busy="uploading" @captured="handleCaptured" />
    </PatientCard>

    <PatientTipCard v-if="uploading" tone="info" title="处理中">
      <p>请保持稳定，正在处理当前图像</p>
    </PatientTipCard>

    <PatientTipCard v-else-if="qualityMessage" tone="success" title="上传完成">
      <p>{{ qualityMessage }}</p>
    </PatientTipCard>

    <PatientTipCard v-if="errorMessage" tone="warning" title="上传失败">
      <p>{{ errorMessage }}</p>
    </PatientTipCard>

    <template #actions>
      <PatientActionBar>
        <button class="secondary" type="button" :disabled="uploading" @click="goBackToGuide">
          返回采集准备
        </button>
      </PatientActionBar>
    </template>
  </PatientPageShell>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { uploadCapture } from '../../api/consultation'
import CameraPreview from '../../components/capture/CameraPreview.vue'
import PatientActionBar from '../../components/patient/PatientActionBar.vue'
import PatientCard from '../../components/patient/PatientCard.vue'
import PatientPageShell from '../../components/patient/PatientPageShell.vue'
import PatientStageHeader from '../../components/patient/PatientStageHeader.vue'
import PatientTipCard from '../../components/patient/PatientTipCard.vue'
import { patientStages } from '../../constants/patientStages'
import { useConsultationStore } from '../../stores/consultation'

const router = useRouter()
const store = useConsultationStore()
const qualityMessage = ref('')
const errorMessage = ref('')
const uploading = ref(false)

function goBackToGuide() {
  router.push('/patient/capture-guide')
}

async function handleCaptured(imageBase64: string) {
  if (uploading.value) return

  if (!store.sessionId) {
    router.push('/patient/welcome')
    return
  }

  errorMessage.value = ''
  qualityMessage.value = ''
  uploading.value = true

  try {
    const response = await uploadCapture(store.sessionId, imageBase64)
    store.latestCapture = {
      capture_id: response.capture_id,
      quality_status: response.quality_status,
      image_base64: `data:image/png;base64,${imageBase64}`,
      image_path: response.image_path,
    }
    store.status = 'tongue_captured'
    qualityMessage.value =
      response.quality_status === 'poor'
        ? '图像质量一般，建议在确认页查看后决定是否重拍'
        : '图像质量良好，可继续进入确认分析'
    router.push('/patient/capture-confirm')
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? `上传失败：${error.message}` : '上传失败，请稍后重试'
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.capture-view__primary-card {
  align-self: stretch;
}

.capture-view :deep(.patient-tip-card__content p) {
  margin: 0;
}

.secondary {
  min-height: 44px;
  padding: 0.85rem 1.4rem;
  border: 1px solid rgba(120, 84, 89, 0.16);
  border-radius: 999px;
  background: rgba(255, 252, 251, 0.92);
  color: var(--patient-text-strong);
  font-weight: 600;
  cursor: pointer;
}

.secondary:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
