<template>
  <main>
    <h2>舌象采集引导</h2>
    <p>请在光线充足环境下伸舌采集。</p>
    <button @click="goCapture">开始采集</button>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goCapture() {
  router.push('/patient/capture')
}
</script>
