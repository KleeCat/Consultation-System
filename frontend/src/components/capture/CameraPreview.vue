<template>
  <div>
    <p v-if="streamError === 'permission_denied'">请允许摄像头权限后重试</p>
    <p v-else>摄像头预览区域</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  streamError?: string
}>()
</script>
