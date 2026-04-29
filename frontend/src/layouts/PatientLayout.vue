<template>
  <section class="patient-layout">
    <RouterView />
  </section>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<style scoped>
.patient-layout {
  min-height: 100vh;
  padding: 32px 16px 48px;
  box-sizing: border-box;
}
</style>
