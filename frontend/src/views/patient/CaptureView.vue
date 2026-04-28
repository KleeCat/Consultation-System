<template>
  <main class="capture-view">
    <header class="capture-header">
      <span class="eyebrow">舌象采集</span>
      <h2>实时采集</h2>
      <p>优先尝试本机摄像头，也支持上传照片和示例图，便于在不同设备上完整走通流程。</p>
    </header>

    <CameraPreview :busy="uploading" @captured="handleCaptured" />

    <p v-if="uploading" class="feedback neutral">正在上传图像并分析质量，请稍候…</p>
    <p v-else-if="qualityMessage" class="feedback success">{{ qualityMessage }}</p>
    <p v-if="errorMessage" class="feedback error">{{ errorMessage }}</p>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { uploadCapture } from '../../api/consultation'
import CameraPreview from '../../components/capture/CameraPreview.vue'
import { useConsultationStore } from '../../stores/consultation'

const router = useRouter()
const store = useConsultationStore()
const qualityMessage = ref('')
const errorMessage = ref('')
const uploading = ref(false)

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
.capture-view {
  display: grid;
  gap: 22px;
}

.capture-header {
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

.capture-header h2 {
  margin: 0;
  color: #4f2d33;
  font-size: 36px;
  line-height: 1.15;
}

.capture-header p {
  margin: 0;
  color: #73595e;
  line-height: 1.8;
}

.feedback {
  margin: 0;
  font-size: 14px;
}

.feedback.neutral {
  color: #6f565a;
}

.feedback.success {
  color: #80555d;
}

.feedback.error {
  color: #b42318;
}
</style>
