<template>
  <footer class="patient-action-bar">
    <div class="patient-action-bar__cluster">
      <slot />
    </div>
  </footer>
</template>

<style scoped>
.patient-action-bar {
  display: flex;
  justify-content: flex-end;
}

.patient-action-bar__cluster {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  width: 100%;
}

@media (max-width: 767px) {
  .patient-action-bar__cluster {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
