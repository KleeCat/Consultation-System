<template>
  <PatientPageShell class="capture-confirm-view">
    <template #header>
      <PatientStageHeader v-bind="patientStages.captureConfirm" />
    </template>

    <PatientCard class="capture-confirm-view__preview-card" title="上传预览" variant="highlight">
      <div class="capture-confirm-view__preview-content">
        <img
          v-if="store.latestCapture?.image_base64"
          :src="store.latestCapture.image_base64"
          alt="capture preview"
        />
        <div v-else class="capture-confirm-view__empty-preview">暂无可确认的舌象预览</div>

        <div class="capture-confirm-view__meta-panel">
          <p class="capture-confirm-view__meta-label">当前质量</p>
          <strong :class="['capture-confirm-view__quality-pill', qualityClass]">
            {{ qualityLabel }}
          </strong>
        </div>
      </div>
    </PatientCard>

    <PatientTipCard :tone="qualityTone" title="质量提示">
      <p>{{ qualityHint }}</p>
    </PatientTipCard>

    <PatientTipCard v-if="errorMessage" tone="warning" title="确认失败">
      <p>{{ errorMessage }}</p>
    </PatientTipCard>

    <template #actions>
      <PatientActionBar>
        <button class="secondary" type="button" :disabled="submitting" @click="retake">
          重新拍摄
        </button>
        <button class="primary" type="button" :disabled="submitting" @click="confirmCapture">
          确认并分析
        </button>
      </PatientActionBar>
    </template>
  </PatientPageShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { selectCapture } from '../../api/consultation'
import PatientActionBar from '../../components/patient/PatientActionBar.vue'
import PatientCard from '../../components/patient/PatientCard.vue'
import PatientPageShell from '../../components/patient/PatientPageShell.vue'
import PatientStageHeader from '../../components/patient/PatientStageHeader.vue'
import PatientTipCard from '../../components/patient/PatientTipCard.vue'
import { patientStages } from '../../constants/patientStages'
import { useConsultationStore } from '../../stores/consultation'

const router = useRouter()
const store = useConsultationStore()
const errorMessage = ref('')
const submitting = ref(false)

const qualityLabel = computed(() =>
  store.latestCapture?.quality_status === 'poor' ? '建议重拍' : '可用于分析',
)

const qualityClass = computed(() =>
  store.latestCapture?.quality_status === 'poor' ? 'warning' : 'good',
)

const qualityTone = computed(() =>
  store.latestCapture?.quality_status === 'poor' ? 'warning' : 'info',
)

const qualityHint = computed(() =>
  store.latestCapture?.quality_status === 'poor'
    ? '当前图像仍可继续测试流程，但正式场景建议重新采集更清晰的舌象照片。'
    : '图像质量满足继续分析的要求，可以直接进入智能分析阶段。',
)

function retake() {
  if (submitting.value) {
    return
  }

  router.push('/patient/capture')
}

async function confirmCapture() {
  if (submitting.value) {
    return
  }

  if (!store.sessionId || !store.latestCapture) {
    router.push('/patient/welcome')
    return
  }

  errorMessage.value = ''
  submitting.value = true

  try {
    await selectCapture(store.sessionId, store.latestCapture.capture_id)
    store.status = 'tongue_confirmed'
    router.push('/patient/analyzing')
  } catch (error) {
    errorMessage.value = error instanceof Error ? `确认失败：${error.message}` : '确认失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.capture-confirm-view__preview-card {
  align-self: stretch;
}

.capture-confirm-view__preview-content {
  display: grid;
  grid-template-columns: minmax(0, 280px) minmax(0, 1fr);
  gap: 20px;
  align-items: center;
}

.capture-confirm-view__preview-content img,
.capture-confirm-view__empty-preview {
  width: 100%;
  min-height: 240px;
  border-radius: 20px;
  background: #f7f0ed;
}

.capture-confirm-view__preview-content img {
  object-fit: cover;
}

.capture-confirm-view__empty-preview {
  display: grid;
  place-items: center;
  color: var(--patient-text-muted);
}

.capture-confirm-view__meta-panel {
  display: grid;
  gap: 12px;
}

.capture-confirm-view__meta-label {
  margin: 0;
  color: var(--patient-text-muted);
  font-size: 13px;
  letter-spacing: 0.08em;
}

.capture-confirm-view__quality-pill {
  width: fit-content;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 15px;
}

.capture-confirm-view__quality-pill.good {
  background: rgba(82, 160, 110, 0.12);
  color: #2f7f4b;
}

.capture-confirm-view__quality-pill.warning {
  background: rgba(186, 88, 77, 0.12);
  color: #af443f;
}

.capture-confirm-view :deep(.patient-tip-card__content p) {
  margin: 0;
}

.primary,
.secondary {
  min-height: var(--patient-button-height);
  padding: 0.85rem 1.4rem;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}

.primary {
  border: 1px solid transparent;
  background: linear-gradient(135deg, #a44b5f, #c96d79);
  color: #fffaf9;
}

.secondary {
  border: 1px solid rgba(120, 84, 89, 0.16);
  background: rgba(255, 252, 251, 0.92);
  color: var(--patient-text-strong);
}

.primary:disabled,
.secondary:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

@media (max-width: 720px) {
  .capture-confirm-view__preview-content {
    grid-template-columns: 1fr;
  }
}
</style>
