<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow: string
    title: string
    description: string
    tone?: 'default' | 'highlight'
  }>(),
  {
    tone: 'default',
  },
)
</script>

<template>
  <header class="patient-stage-header" :class="`tone-${tone}`">
    <p class="patient-stage-header__eyebrow">{{ eyebrow }}</p>
    <h1 class="patient-stage-header__title">{{ title }}</h1>
    <p class="patient-stage-header__description">{{ description }}</p>
  </header>
</template>

<style scoped>
.patient-stage-header {
  display: grid;
  gap: 8px;
  padding: var(--patient-card-padding);
  border-radius: var(--patient-card-radius);
  background: rgba(255, 252, 251, 0.86);
  border: 1px solid rgba(181, 91, 109, 0.12);
  box-shadow: var(--patient-shadow);
}

.patient-stage-header.tone-highlight {
  background: linear-gradient(135deg, rgba(181, 91, 109, 0.16), rgba(255, 252, 251, 0.96));
  border-color: rgba(181, 91, 109, 0.2);
}

.patient-stage-header__eyebrow {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--patient-accent);
}

.patient-stage-header__title {
  margin: 0;
  font-size: clamp(1.75rem, 4vw, 2.4rem);
  line-height: 1.2;
  color: var(--patient-text-strong);
}

.patient-stage-header__description {
  margin: 0;
  line-height: 1.7;
  color: var(--patient-text-muted);
}
</style>
