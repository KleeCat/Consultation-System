<template>
  <main>
    <h2>症状问答</h2>
    <div v-for="question in questions" :key="question.question_code">
      <p>{{ question.question_text }}</p>
      <select v-model="answers[question.question_code]">
        <option
          v-for="option in question.options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </div>
    <button @click="submitAnswers">下一步</button>
  </main>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

import { submitQuestionnaire } from '../../api/consultation'
import { useConsultationStore } from '../../stores/consultation'

const router = useRouter()
const store = useConsultationStore()

const questions = [
  {
    question_code: 'fatigue_level',
    question_text: '你最近是否容易疲劳、乏力？',
    options: [
      { value: 'never', label: '从不' },
      { value: 'rarely', label: '很少' },
      { value: 'sometimes', label: '有时' },
      { value: 'often', label: '经常' },
      { value: 'always', label: '总是' },
    ],
  },
  {
    question_code: 'cold_hands_feet',
    question_text: '你是否经常手脚发凉、怕冷？',
    options: [
      { value: 'never', label: '从不' },
      { value: 'rarely', label: '很少' },
      { value: 'sometimes', label: '有时' },
      { value: 'often', label: '经常' },
      { value: 'always', label: '总是' },
    ],
  },
]

const answers = reactive<Record<string, string>>({
  fatigue_level: 'often',
  cold_hands_feet: 'always',
})

async function submitAnswers() {
  if (!store.sessionId) {
    router.push('/patient/welcome')
    return
  }

  const response = await submitQuestionnaire(
    store.sessionId,
    questions.map((question) => ({
      question_code: question.question_code,
      answer_value: answers[question.question_code],
    })),
  )

  store.status = response.session_status
  store.questionnaireSummary = response.summary
  router.push('/patient/capture-guide')
}
</script>
