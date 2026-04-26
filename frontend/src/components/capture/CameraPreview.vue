<template>
  <div>
    <p v-if="streamError === 'permission_denied'">请允许摄像头权限后重试</p>
    <template v-else>
      <p>摄像头预览区域</p>
      <input type="file" accept="image/*" @change="handleFileChange" />
      <button @click="useDemoImage">使用示例舌象图片</button>
    </template>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  captured: [imageBase64: string]
}>()

defineProps<{
  streamError?: string
}>()

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    const result = String(reader.result ?? '')
    const base64 = result.split(',')[1]
    if (base64) {
      emit('captured', base64)
    }
  }
  reader.readAsDataURL(file)
}

function useDemoImage() {
  const demoBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAgUlEQVR4nNXOMREAIBDAsFL/IphRgixE/MA1CrLu2ZRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMRJnMT5OzD1ACdUApJaXFJYAAAAAElFTkSuQmCC'
  emit('captured', demoBase64)
}
</script>
