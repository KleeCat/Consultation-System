<template>
  <article class="question-card">
    <header class="question-header">
      <div class="question-title-row">
        <h3>{{ question.question_text }}</h3>
        <span v-if="question.required" class="required-badge">必答</span>
      </div>
      <p v-if="question.question_help" class="question-help">{{ question.question_help }}</p>
    </header>

    <div class="option-list">
      <button
        v-for="option in question.options"
        :key="option.value"
        type="button"
        class="option-card"
        :class="{ selected: modelValue === option.value }"
        @click="$emit('update:modelValue', option.value)"
      >
        <span class="option-label">{{ option.label }}</span>
        <small v-if="option.description" class="option-description">{{ option.description }}</small>
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { QuestionnaireQuestion } from '../../api/consultation'

defineProps<{
  question: QuestionnaireQuestion
  modelValue: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<style scoped>
.question-card {
  display: grid;
  gap: 18px;
  padding: 22px;
  border: 1px solid rgba(164, 118, 126, 0.16);
  border-radius: 24px;
  background: #fffdfc;
  box-shadow: 0 18px 36px rgba(110, 54, 66, 0.08);
}

.question-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

h3 {
  margin: 0;
  color: #593239;
  font-size: 20px;
}

.required-badge {
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(191, 88, 105, 0.12);
  color: #b05061;
  font-size: 12px;
  font-weight: 600;
}

.question-help {
  margin: 10px 0 0;
  color: #82676c;
  line-height: 1.7;
}

.option-list {
  display: grid;
  gap: 12px;
}

.option-card {
  display: grid;
  gap: 6px;
  width: 100%;
  padding: 16px 18px;
  border: 1px solid rgba(180, 129, 137, 0.18);
  border-radius: 18px;
  background: rgba(255, 247, 246, 0.94);
  text-align: left;
  color: #5e373e;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;
}

.option-card:hover {
  transform: translateY(-1px);
  border-color: rgba(192, 99, 115, 0.32);
  box-shadow: 0 12px 28px rgba(180, 98, 112, 0.12);
}

.option-card.selected {
  border-color: rgba(181, 74, 93, 0.56);
  background: linear-gradient(135deg, rgba(255, 237, 238, 0.98), rgba(255, 245, 245, 0.98));
  box-shadow: 0 14px 30px rgba(176, 87, 103, 0.16);
}

.option-label {
  font-size: 16px;
  font-weight: 600;
}

.option-description {
  color: #8e7075;
  line-height: 1.6;
}
</style>
