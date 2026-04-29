<template>
  <PatientPageShell class="questionnaire-page">
    <template #header>
      <PatientStageHeader v-bind="patientStages.questionnaire" />
    </template>

    <PatientStatusCard
      v-if="loadError"
      tone="error"
      title="问卷加载失败"
      :description="loadError"
    />

    <PatientStatusCard
      v-else-if="loading"
      tone="loading"
      title="正在加载问卷"
      description="正在获取问诊题库，请稍候…"
    />

    <template v-else-if="template && currentGroup">
      <QuestionnaireProgress
        :title="template.title"
        :description="template.description"
        :current-group-index="currentGroupIndex"
        :total-groups="groupedGroups.length"
        :current-group-title="currentGroup.group_title"
      />

      <PatientCard variant="highlight">
        <p class="group-eyebrow">当前分组</p>
        <h2>{{ currentGroup.group_title }}</h2>
        <p>{{ currentGroup.group_description }}</p>
      </PatientCard>

      <QuestionCard
        v-for="question in currentGroup.questions"
        :key="question.question_code"
        v-model="answers[question.question_code]"
        :question="question"
      />
    </template>

    <PatientStatusCard
      v-else
      tone="empty"
      title="暂无问卷内容"
      description="当前未获取到可展示的问卷分组，请重新加载后重试。"
    />

    <template v-if="template && currentGroup && (validationError || submitError)" #aside>
      <PatientTipCard v-if="validationError" tone="warning">
        <p>{{ validationError }}</p>
      </PatientTipCard>

      <PatientTipCard v-if="submitError" tone="warning">
        <p>{{ submitError }}</p>
      </PatientTipCard>
    </template>

    <template v-if="loadError || (!loading && (!template || !currentGroup))" #actions>
      <PatientActionBar>
        <button type="button" class="secondary" @click="loadTemplate">重新加载</button>
        <button type="button" class="ghost" @click="goToProfile">返回建档页</button>
      </PatientActionBar>
    </template>

    <template v-else-if="template && currentGroup" #actions>
      <PatientActionBar>
        <button
          type="button"
          class="secondary"
          data-testid="prev-group"
          :disabled="currentGroupIndex === 0 || submitting"
          @click="goToPreviousGroup"
        >
          上一步
        </button>

        <button
          v-if="!isLastGroup"
          type="button"
          class="primary"
          data-testid="next-group"
          :disabled="submitting"
          @click="goToNextGroup"
        >
          下一步
        </button>

        <button
          v-else
          type="button"
          class="primary"
          data-testid="submit-questionnaire"
          :disabled="submitting"
          @click="submitAnswers"
        >
          {{ submitting ? '提交中…' : '提交并进入舌象采集' }}
        </button>
      </PatientActionBar>
    </template>
  </PatientPageShell>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import {
  getQuestionnaireTemplate,
  submitQuestionnaire,
  type QuestionnaireGroup,
  type QuestionnaireQuestion,
  type QuestionnaireTemplateResponse,
} from '../../api/consultation'
import PatientActionBar from '../../components/patient/PatientActionBar.vue'
import PatientCard from '../../components/patient/PatientCard.vue'
import PatientPageShell from '../../components/patient/PatientPageShell.vue'
import PatientStageHeader from '../../components/patient/PatientStageHeader.vue'
import PatientStatusCard from '../../components/patient/PatientStatusCard.vue'
import PatientTipCard from '../../components/patient/PatientTipCard.vue'
import QuestionCard from '../../components/questionnaire/QuestionCard.vue'
import QuestionnaireProgress from '../../components/questionnaire/QuestionnaireProgress.vue'
import { patientStages } from '../../constants/patientStages'
import { useConsultationStore } from '../../stores/consultation'

type GroupedQuestionnaireGroup = QuestionnaireGroup & {
  questions: QuestionnaireQuestion[]
}

const router = useRouter()
const store = useConsultationStore()

const template = ref<QuestionnaireTemplateResponse | null>(null)
const currentGroupIndex = ref(0)
const loading = ref(false)
const submitting = ref(false)
const loadError = ref('')
const validationError = ref('')
const submitError = ref('')
const answers = reactive<Record<string, string>>({})

const groupedGroups = computed<GroupedQuestionnaireGroup[]>(() => {
  if (!template.value) return []

  return template.value.groups
    .map((group) => ({
      ...group,
      questions: template.value!.questions.filter((question) => question.group_code === group.group_code),
    }))
    .filter((group) => group.questions.length > 0)
})

const currentGroup = computed(() => groupedGroups.value[currentGroupIndex.value] ?? null)
const isLastGroup = computed(() => currentGroupIndex.value === groupedGroups.value.length - 1)

function isGroupComplete(index: number) {
  const group = groupedGroups.value[index]
  if (!group) return false

  return group.questions.every((question) => !question.required || Boolean(answers[question.question_code]))
}

function clearMessages() {
  validationError.value = ''
  submitError.value = ''
}

function goToProfile() {
  router.push('/patient/profile')
}

async function loadTemplate() {
  if (!store.sessionId) {
    router.push('/patient/welcome')
    return
  }

  loading.value = true
  loadError.value = ''
  clearMessages()

  try {
    const response = await getQuestionnaireTemplate()
    template.value = response
    currentGroupIndex.value = 0

    response.questions.forEach((question) => {
      if (!(question.question_code in answers)) {
        answers[question.question_code] = ''
      }
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知错误'
    loadError.value = `问卷加载失败：${message}`
  } finally {
    loading.value = false
  }
}

function goToPreviousGroup() {
  if (currentGroupIndex.value === 0) return
  currentGroupIndex.value -= 1
  clearMessages()
}

function goToNextGroup() {
  if (!isGroupComplete(currentGroupIndex.value)) {
    validationError.value = '请先完成当前分组的必答题'
    return
  }

  if (currentGroupIndex.value < groupedGroups.value.length - 1) {
    currentGroupIndex.value += 1
    clearMessages()
  }
}

async function submitAnswers() {
  if (!store.sessionId) {
    router.push('/patient/welcome')
    return
  }

  if (!template.value) return

  if (!isGroupComplete(currentGroupIndex.value)) {
    validationError.value = '请先完成当前分组的必答题'
    return
  }

  submitting.value = true
  submitError.value = ''
  validationError.value = ''

  try {
    const response = await submitQuestionnaire(
      store.sessionId,
      template.value.questions.map((question) => ({
        question_code: question.question_code,
        answer_value: answers[question.question_code],
      })),
    )

    store.status = response.session_status
    store.questionnaireSummary = response.summary
    router.push('/patient/capture-guide')
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知错误'
    submitError.value = `问卷提交失败：${message}`
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  void loadTemplate()
})
</script>

<style scoped>
.questionnaire-page {
  gap: 20px;
}

.group-eyebrow {
  margin: 0;
  color: #b35d6b;
  font-size: 13px;
}

h2 {
  margin: 0;
  color: #5b3037;
}

p {
  margin: 0;
  color: #7d6166;
  line-height: 1.7;
}

.primary,
.secondary,
.ghost {
  min-height: 48px;
  padding: 0 18px;
  border-radius: 16px;
  border: 1px solid transparent;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    opacity 0.18s ease;
}

.primary:hover:enabled,
.secondary:hover:enabled,
.ghost:hover:enabled {
  transform: translateY(-1px);
}

.primary:disabled,
.secondary:disabled,
.ghost:disabled {
  opacity: 0.56;
  cursor: not-allowed;
}

.primary {
  background: linear-gradient(135deg, #b55b6d, #d37b8e);
  color: #fffaf9;
  box-shadow: 0 16px 30px rgba(181, 91, 109, 0.22);
}

.secondary {
  background: rgba(181, 91, 109, 0.08);
  border-color: rgba(181, 91, 109, 0.18);
  color: #7f4250;
}

.ghost {
  background: rgba(255, 252, 251, 0.92);
  border-color: rgba(181, 91, 109, 0.16);
  color: #7f4250;
}
</style>
