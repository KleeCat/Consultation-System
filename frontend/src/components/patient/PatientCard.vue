<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    variant?: 'default' | 'highlight' | 'soft'
  }>(),
  {
    title: undefined,
    variant: 'default',
  },
)
</script>

<template>
  <article class="patient-card" :class="`variant-${variant}`">
    <header v-if="title" class="patient-card__header">
      <h2 class="patient-card__title">{{ title }}</h2>
    </header>
    <div class="patient-card__content">
      <slot />
    </div>
  </article>
</template>

<style scoped>
.patient-card {
  display: grid;
  gap: 16px;
  padding: var(--patient-card-padding);
  border-radius: var(--patient-card-radius);
  background: var(--patient-card-bg);
  border: 1px solid var(--patient-line);
  box-shadow: var(--patient-shadow);
}

.patient-card.variant-highlight {
  background: linear-gradient(180deg, rgba(255, 246, 241, 0.96), rgba(255, 252, 251, 0.98));
  border-color: rgba(181, 91, 109, 0.18);
}

.patient-card.variant-soft {
  background: rgba(255, 252, 251, 0.8);
  box-shadow: 0 10px 24px rgba(111, 59, 69, 0.04);
}

.patient-card__header,
.patient-card__content {
  display: grid;
  gap: 12px;
}

.patient-card__title {
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.5;
  color: var(--patient-text-strong);
}
</style>
