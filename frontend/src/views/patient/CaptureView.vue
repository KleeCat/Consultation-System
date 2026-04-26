<template>
  <main>
    <h2>实时采集</h2>
    <CameraPreview @captured="handleCaptured" />
    <p v-if="qualityMessage">{{ qualityMessage }}</p>
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

async function handleCaptured(imageBase64: string) {
  if (!store.sessionId) {
    router.push('/patient/welcome')
    return
  }

  const response = await uploadCapture(store.sessionId, imageBase64)
  store.latestCapture = {
    capture_id: response.capture_id,
    quality_status: response.quality_status,
    image_base64: `data:image/png;base64,${imageBase64}`,
    image_path: response.image_path,
  }
  qualityMessage.value = response.quality_status === 'poor' ? '图像质量一般，可重拍。' : '图像可用于分析。'
  router.push('/patient/capture-confirm')
}
</script>
