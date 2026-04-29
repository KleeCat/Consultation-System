<template>
  <PatientPageShell>
    <template #header>
      <PatientStageHeader v-bind="patientStages.profile" />
    </template>

    <PatientCard title="基础信息" variant="highlight">
      <form class="profile-form" @submit.prevent="submitProfile">
        <label class="field">
          <span class="field__label">姓名</span>
          <input v-model.trim="form.name" class="field__control" type="text" @input="clearFieldError('name')" />
          <p v-if="fieldErrors.name" class="field__error">{{ fieldErrors.name }}</p>
        </label>

        <label class="field">
          <span class="field__label">性别</span>
          <select v-model="form.gender" class="field__control">
            <option value="female">女</option>
            <option value="male">男</option>
          </select>
        </label>

        <label class="field">
          <span class="field__label">年龄</span>
          <input
            v-model.number="form.age"
            class="field__control"
            type="number"
            min="1"
            max="120"
            @input="clearFieldError('age')"
          />
          <p v-if="fieldErrors.age" class="field__error">{{ fieldErrors.age }}</p>
        </label>
      </form>
    </PatientCard>

    <PatientTipCard tone="info" title="填写说明">
      <p>请填写本次问诊使用的基础信息，姓名与年龄将用于生成后续问答与分析记录。</p>
      <p>建议使用真实年龄，并在进入下一步前确认信息无误。</p>
    </PatientTipCard>

    <PatientTipCard v-if="errorMessage" tone="warning" title="提交失败">
      <p>{{ errorMessage }}</p>
    </PatientTipCard>

    <template #actions>
      <PatientActionBar>
        <button class="secondary" type="button" @click="goBack">返回欢迎页</button>
        <button class="primary" type="button" :disabled="submitting" @click="submitProfile">
          {{ submitting ? '提交中...' : '下一步' }}
        </button>
      </PatientActionBar>
    </template>
  </PatientPageShell>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { createSession } from '../../api/consultation'
import PatientActionBar from '../../components/patient/PatientActionBar.vue'
import PatientCard from '../../components/patient/PatientCard.vue'
import PatientPageShell from '../../components/patient/PatientPageShell.vue'
import PatientStageHeader from '../../components/patient/PatientStageHeader.vue'
import PatientTipCard from '../../components/patient/PatientTipCard.vue'
import { patientStages } from '../../constants/patientStages'
import { useConsultationStore } from '../../stores/consultation'

type FieldKey = 'name' | 'age'

const router = useRouter()
const store = useConsultationStore()
const form = reactive({ ...store.profile })
const submitting = ref(false)
const errorMessage = ref('')
const fieldErrors = reactive<Record<FieldKey, string>>({
  name: '',
  age: '',
})

function clearFieldError(field: FieldKey) {
  fieldErrors[field] = ''
}

function validateForm() {
  fieldErrors.name = form.name ? '' : '请输入姓名'
  fieldErrors.age =
    Number(form.age) >= 1 && Number(form.age) <= 120 ? '' : '年龄需在 1 到 120 岁之间'

  return !fieldErrors.name && !fieldErrors.age
}

function goBack() {
  router.push('/patient/welcome')
}

async function submitProfile() {
  errorMessage.value = ''

  if (!validateForm()) {
    return
  }

  submitting.value = true

  try {
    const session = await createSession({
      name: form.name || '演示患者',
      gender: form.gender,
      age: Number(form.age),
    })
    store.sessionId = session.session_id
    store.profile = { ...form }
    store.status = session.session_status
    router.push('/patient/questionnaire')
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? `提交失败：${error.message}` : '提交失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.profile-form {
  display: grid;
  gap: 1rem;
}

.field {
  display: grid;
  gap: 0.5rem;
}

.field__label {
  font-weight: 600;
  color: var(--patient-text-strong);
}

.field__control {
  min-height: 44px;
  padding: 0.75rem 0.9rem;
  border: 1px solid var(--patient-line);
  border-radius: 14px;
  background: rgba(255, 252, 251, 0.92);
  color: var(--patient-text-strong);
}

.field__error {
  margin: 0;
  font-size: 0.9rem;
  color: #b42318;
}

.primary,
.secondary {
  min-height: 44px;
  padding: 0.85rem 1.4rem;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}

.primary {
  border: none;
  background: var(--patient-accent);
  color: #fff;
}

.primary:disabled {
  opacity: 0.68;
  cursor: not-allowed;
}

.secondary {
  border: 1px solid rgba(181, 91, 109, 0.24);
  background: rgba(255, 252, 251, 0.94);
  color: var(--patient-text-strong);
}
</style>
