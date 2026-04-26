<template>
  <section>
    <StepProgress />
    <RouterView />
  </section>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'

import StepProgress from '../components/common/StepProgress.vue'
</script>
