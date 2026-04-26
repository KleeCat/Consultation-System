<template>
  <main>
    <h2>确认舌象图片</h2>
    <img
      v-if="store.latestCapture?.image_base64"
      :src="store.latestCapture.image_base64"
      alt="capture preview"
      style="max-width: 240px;"
    />
    <p>当前质量：{{ store.latestCapture?.quality_status ?? '未知' }}</p>
    <button @click="retake">重新拍摄</button>
    <button @click="confirmCapture">确认并分析</button>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

import { selectCapture } from '../../api/consultation'
import { useConsultationStore } from '../../stores/consultation'

const router = useRouter()
const store = useConsultationStore()

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
