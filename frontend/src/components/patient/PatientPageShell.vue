<template>
  <main class="patient-page-shell">
    <header v-if="$slots.header" class="patient-page-shell__header">
      <slot name="header" />
    </header>

    <section class="patient-page-shell__main">
      <slot />
    </section>

    <aside v-if="$slots.aside" class="patient-page-shell__aside">
      <slot name="aside" />
    </aside>

    <footer v-if="$slots.actions" class="patient-page-shell__actions">
      <slot name="actions" />
    </footer>
  </main>
</template>

<style scoped>
.patient-page-shell {
  display: grid;
  gap: var(--patient-page-gap);
  width: min(100%, 880px);
  margin: 0 auto;
}

.patient-page-shell__header,
.patient-page-shell__main,
.patient-page-shell__aside,
.patient-page-shell__actions {
  display: grid;
  gap: var(--patient-page-gap);
}
</style>
