<template>
  <main>
    <h2>欢迎使用智能中医问诊系统</h2>
    <p>请先开始问诊流程。</p>
    <button @click="startConsultation">开始问诊</button>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

import { useConsultationStore } from '../../stores/consultation'

const router = useRouter()
const store = useConsultationStore()

function startConsultation() {
  store.reset()
  router.push('/patient/profile')
}
</script>
