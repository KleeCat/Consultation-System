<template>
  <main>
    <h2>问诊记录</h2>
    <RecordTable :items="items" @select="handleSelect" />
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { listAdminRecords, type AdminRecordItem } from '../../api/admin'
import RecordTable from '../../components/admin/RecordTable.vue'

const router = useRouter()
const items = ref<AdminRecordItem[]>([])

function handleSelect(item: AdminRecordItem) {
  router.push(`/admin/records/${item.session_id}`)
}

onMounted(async () => {
  const response = await listAdminRecords()
  items.value = response.items
})
</script>
