<script setup lang="ts">
defineProps<{
  tone: 'info' | 'warning' | 'success'
  title?: string
}>()
</script>

<template>
  <aside class="patient-tip-card" :class="`tone-${tone}`">
    <p v-if="title" class="patient-tip-card__title">{{ title }}</p>
    <div class="patient-tip-card__content">
      <slot />
    </div>
  </aside>
</template>

<style scoped>
.patient-tip-card {
  display: grid;
  gap: 12px;
  padding: var(--patient-card-padding);
  border-radius: var(--patient-card-radius);
  border: 1px solid transparent;
  box-shadow: var(--patient-shadow);
}

.patient-tip-card.tone-info {
  background: rgba(255, 252, 251, 0.92);
  border-color: rgba(181, 91, 109, 0.16);
}

.patient-tip-card.tone-warning {
  background: rgba(255, 248, 240, 0.98);
  border-color: rgba(168, 106, 63, 0.3);
  color: var(--patient-warning);
}

.patient-tip-card.tone-success {
  background: rgba(244, 252, 246, 0.98);
  border-color: rgba(79, 141, 99, 0.28);
  color: var(--patient-success);
}

.patient-tip-card__title {
  margin: 0;
  font-weight: 600;
  color: var(--patient-text-strong);
}

.patient-tip-card__content {
  display: grid;
  gap: 8px;
  line-height: 1.7;
  color: var(--patient-text-muted);
}

.patient-tip-card.tone-warning .patient-tip-card__content {
  color: inherit;
}

.patient-tip-card.tone-success .patient-tip-card__content {
  color: inherit;
}
</style>
