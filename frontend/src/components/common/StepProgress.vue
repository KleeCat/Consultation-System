<template>
  <div>当前流程：{{ store.status }}</div>
</template>

<script setup lang="ts">
import { useConsultationStore } from '../../stores/consultation'

const store = useConsultationStore()
</script>
