<template>
  <main class="confirm-view">
    <header class="confirm-header">
      <span class="eyebrow">采集确认</span>
      <h2>确认舌象图片</h2>
      <p>请快速检查清晰度、光线和居中情况，确认后将进入分析阶段。</p>
    </header>

    <section class="preview-card">
      <img
        v-if="store.latestCapture?.image_base64"
        :src="store.latestCapture.image_base64"
        alt="capture preview"
      />
      <div class="meta-panel">
        <p class="meta-label">当前质量</p>
        <strong :class="['quality-pill', qualityClass]">{{ qualityLabel }}</strong>
        <p class="meta-copy">
          {{ qualityHint }}
        </p>
      </div>
    </section>

    <div class="action-row">
      <button class="ghost" type="button" @click="retake">重新拍摄</button>
      <button class="primary" type="button" @click="confirmCapture">确认并分析</button>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { selectCapture } from '../../api/consultation'
import { useConsultationStore } from '../../stores/consultation'

const router = useRouter()
const store = useConsultationStore()

const qualityLabel = computed(() =>
  store.latestCapture?.quality_status === 'poor' ? '建议重拍' : '可用于分析',
)

const qualityClass = computed(() =>
  store.latestCapture?.quality_status === 'poor' ? 'warning' : 'good',
)

const qualityHint = computed(() =>
  store.latestCapture?.quality_status === 'poor'
    ? '当前图像仍可继续测试流程，但正式场景建议重新采集更清晰的舌象照片。'
    : '图像质量满足继续分析的要求，可以直接进入智能分析阶段。'
)

function retake() {
  router.push('/patient/capture')
}

async function confirmCapture() {
  if (!store.sessionId || !store.latestCapture) {
    router.push('/patient/welcome')
    return
  }

  await selectCapture(store.sessionId, store.latestCapture.capture_id)
  store.status = 'tongue_confirmed'
  router.push('/patient/analyzing')
}
</script>

<style scoped>
.confirm-view {
  display: grid;
  gap: 24px;
}

.confirm-header {
  display: grid;
  gap: 8px;
}

.eyebrow {
  display: inline-flex;
  width: fit-content;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(175, 92, 104, 0.12);
  color: #a15a68;
  font-size: 12px;
  letter-spacing: 0.08em;
}

.confirm-header h2 {
  margin: 0;
  color: #4f2d33;
  font-size: 34px;
  line-height: 1.15;
}

.confirm-header p {
  margin: 0;
  color: #73595e;
  line-height: 1.8;
}

.preview-card {
  display: grid;
  grid-template-columns: minmax(0, 280px) minmax(0, 1fr);
  gap: 20px;
  align-items: center;
  padding: 20px;
  border: 1px solid rgba(168, 132, 132, 0.24);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 18px 46px rgba(95, 56, 63, 0.08);
}

.preview-card img {
  width: 100%;
  border-radius: 20px;
  background: #f7f0ed;
}

.meta-panel {
  display: grid;
  gap: 12px;
}

.meta-label {
  margin: 0;
  color: #7a6065;
  font-size: 13px;
  letter-spacing: 0.08em;
}

.quality-pill {
  width: fit-content;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 15px;
}

.quality-pill.good {
  background: rgba(82, 160, 110, 0.12);
  color: #2f7f4b;
}

.quality-pill.warning {
  background: rgba(186, 88, 77, 0.12);
  color: #af443f;
}

.meta-copy {
  margin: 0;
  color: #664c52;
  line-height: 1.8;
}

.action-row {
  display: flex;
  gap: 12px;
}

.action-row button {
  min-height: 48px;
  padding: 0 18px;
  border-radius: 16px;
  border: 1px solid transparent;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.primary {
  background: linear-gradient(135deg, #a44b5f, #c96d79);
  color: #fffaf9;
}

.ghost {
  background: #fff;
  border-color: rgba(120, 84, 89, 0.16);
  color: #5d3e44;
}

@media (max-width: 720px) {
  .preview-card {
    grid-template-columns: 1fr;
  }

  .action-row {
    flex-direction: column;
  }
}
</style>
