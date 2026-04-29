<template>
  <section class="progress-card">
    <div class="progress-meta">
      <div>
        <p class="eyebrow">问诊问卷</p>
        <h2>{{ title }}</h2>
        <p class="description">{{ description }}</p>
      </div>
      <strong>第 {{ currentGroupIndex + 1 }} / {{ totalGroups }} 组</strong>
    </div>

    <p class="current-group">{{ currentGroupTitle }}</p>

    <div class="progress-track" aria-hidden="true">
      <div class="progress-bar" :style="{ width: `${progressPercent}%` }" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  description: string
  currentGroupIndex: number
  totalGroups: number
  currentGroupTitle: string
}>()

const progressPercent = computed(() => {
  if (props.totalGroups <= 0) return 0
  return Math.round(((props.currentGroupIndex + 1) / props.totalGroups) * 100)
})
</script>

<style scoped>
.progress-card {
  display: grid;
  gap: 14px;
  padding: 22px;
  border: 1px solid rgba(165, 103, 114, 0.18);
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(255, 248, 247, 0.96), rgba(253, 239, 237, 0.92));
  box-shadow: 0 18px 40px rgba(123, 63, 75, 0.08);
}

.progress-meta {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.eyebrow {
  margin: 0 0 6px;
  color: #b35a68;
  font-size: 13px;
}

h2 {
  margin: 0;
  color: #5e3138;
  font-size: 28px;
}

.description,
.current-group {
  margin: 0;
  color: #7f6368;
  line-height: 1.7;
}

.current-group {
  font-weight: 600;
  color: #7a4551;
}

.progress-track {
  height: 10px;
  border-radius: 999px;
  background: rgba(187, 130, 139, 0.14);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #c86a7a, #a94c62);
  transition: width 0.2s ease;
}

@media (max-width: 720px) {
  .progress-meta {
    flex-direction: column;
  }
}
</style>
