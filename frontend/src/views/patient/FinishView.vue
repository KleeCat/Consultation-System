<template>
  <main>
    <h2>问诊完成</h2>
    <p>感谢使用。</p>
    <button @click="goHome">返回首页</button>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

import { useConsultationStore } from '../../stores/consultation'

const router = useRouter()
const store = useConsultationStore()

function goHome() {
  store.reset()
  router.push('/patient/welcome')
}
</script>
