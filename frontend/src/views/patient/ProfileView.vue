<template>
  <main>
    <h2>基础信息</h2>
    <label>
      姓名
      <input v-model="form.name" />
    </label>
    <label>
      性别
      <select v-model="form.gender">
        <option value="female">女</option>
        <option value="male">男</option>
      </select>
    </label>
    <label>
      年龄
      <input v-model.number="form.age" type="number" min="1" max="120" />
    </label>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <button :disabled="submitting" @click="submitProfile">
      {{ submitting ? '提交中...' : '下一步' }}
    </button>
  </main>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { createSession } from '../../api/consultation'
import { useConsultationStore } from '../../stores/consultation'

const router = useRouter()
const store = useConsultationStore()
const form = reactive({ ...store.profile })
const submitting = ref(false)
const errorMessage = ref('')

async function submitProfile() {
  errorMessage.value = ''
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
.error {
  margin: 0;
  color: #b42318;
}
</style>
