<script setup lang="ts">
defineProps<{
  tone: 'loading' | 'success' | 'error' | 'empty'
  title: string
  description: string
}>()
</script>

<template>
  <section class="patient-status-card" :class="`tone-${tone}`" role="status">
    <div class="patient-status-card__body">
      <h2 class="patient-status-card__title">{{ title }}</h2>
      <p class="patient-status-card__description">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="patient-status-card__actions">
      <slot name="actions" />
    </div>
  </section>
</template>

<style scoped>
.patient-status-card {
  display: grid;
  gap: 20px;
  padding: var(--patient-card-padding);
  border-radius: var(--patient-card-radius);
  border: 1px solid transparent;
  box-shadow: var(--patient-shadow);
  background: var(--patient-card-bg);
}

.patient-status-card.tone-loading {
  border-color: rgba(181, 91, 109, 0.18);
}

.patient-status-card.tone-success {
  background: rgba(244, 252, 246, 0.98);
  border-color: rgba(79, 141, 99, 0.28);
}

.patient-status-card.tone-error {
  background: rgba(255, 245, 247, 0.98);
  border-color: rgba(181, 72, 97, 0.28);
}

.patient-status-card.tone-empty {
  background: rgba(255, 252, 251, 0.84);
  border-color: var(--patient-line);
}

.patient-status-card__body {
  display: grid;
  gap: 8px;
}

.patient-status-card__title {
  margin: 0;
  font-size: 1.25rem;
  line-height: 1.4;
  color: var(--patient-text-strong);
}

.patient-status-card__description {
  margin: 0;
  line-height: 1.7;
  color: var(--patient-text-muted);
}

.patient-status-card__actions {
  display: flex;
  justify-content: flex-end;
}
</style>
