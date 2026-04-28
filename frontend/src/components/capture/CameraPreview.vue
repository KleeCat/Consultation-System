<template>
  <section class="capture-panel">
    <div class="preview-stage" :class="{ ready: cameraStatus === 'ready' }">
      <video
        v-if="cameraStatus === 'ready'"
        ref="videoRef"
        autoplay
        muted
        playsinline
      />
      <div v-else class="preview-placeholder">
        <div class="preview-badge">舌象采集</div>
        <h3>{{ previewTitle }}</h3>
        <p>{{ previewDescription }}</p>
      </div>
      <canvas ref="canvasRef" class="hidden-canvas" />
    </div>

    <div class="helper-copy">
      <p v-if="cameraStatus === 'starting'" class="helper-text neutral">正在连接摄像头，请稍候…</p>
      <p v-else-if="cameraError === 'permission_denied'" class="helper-text warning">
        请允许摄像头权限后重试
      </p>
      <p v-else-if="cameraError === 'unavailable'" class="helper-text warning">
        未检测到可用摄像头，请上传本地照片或使用示例图继续测试
      </p>
      <p v-else class="helper-text neutral">
        请让舌面居中、光线均匀，避免逆光和明显阴影
      </p>
    </div>

    <div class="action-row">
      <button
        class="primary"
        type="button"
        :disabled="busy || cameraStatus !== 'ready'"
        @click="captureFromCamera"
      >
        拍照采集
      </button>
      <button
        class="secondary"
        type="button"
        :disabled="busy || cameraStatus === 'starting'"
        @click="startCamera"
      >
        {{ cameraStatus === 'idle' ? '开启摄像头' : '重新开启摄像头' }}
      </button>
      <button class="ghost" type="button" :disabled="busy" @click="useDemoImage">
        使用示例舌象图片
      </button>
    </div>

    <label class="upload-card" :class="{ disabled: busy }">
      <input :disabled="busy" type="file" accept="image/*" @change="handleFileChange" />
      <strong>上传本地舌象照片</strong>
      <span>适合没有摄像头、权限被拒绝，或使用手机拍照后的图片继续测试</span>
    </label>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import { demoTongueBase64 } from '../../constants/demoTongueBase64'

const emit = defineEmits<{
  captured: [imageBase64: string]
}>()

const props = withDefaults(
  defineProps<{
    busy?: boolean
  }>(),
  {
    busy: false,
  },
)

const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const streamRef = ref<MediaStream | null>(null)
const cameraStatus = ref<'idle' | 'starting' | 'ready' | 'error'>('idle')
const cameraError = ref<'' | 'permission_denied' | 'unavailable'>('')

const previewTitle = computed(() => {
  if (cameraStatus.value === 'starting') return '正在准备摄像头'
  if (cameraError.value === 'permission_denied') return '摄像头权限未开启'
  if (cameraError.value === 'unavailable') return '当前无法使用摄像头'
  return '准备采集实时舌象'
})

const previewDescription = computed(() => {
  if (cameraStatus.value === 'starting') return '建立视频流后即可直接拍照采集'
  if (cameraError.value === 'permission_denied') return '你仍然可以改用上传图片或示例舌象图继续流程'
  if (cameraError.value === 'unavailable') return '这通常发生在无摄像头设备、虚拟机或浏览器禁用了媒体能力时'
  return '系统会优先尝试调用本机摄像头，也支持上传图片或示例图兜底'
})

function stopCamera() {
  streamRef.value?.getTracks().forEach((track) => track.stop())
  streamRef.value = null
  if (videoRef.value) {
    videoRef.value.srcObject = null
  }
}

async function startCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    cameraStatus.value = 'error'
    cameraError.value = 'unavailable'
    return
  }

  stopCamera()
  cameraStatus.value = 'starting'
  cameraError.value = ''

  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 960 },
      },
    })

    streamRef.value = mediaStream
    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream
      await Promise.resolve(videoRef.value.play())
    }
    cameraStatus.value = 'ready'
  } catch (error) {
    const errorName =
      typeof error === 'object' && error && 'name' in error ? String(error.name) : ''
    cameraStatus.value = 'error'
    cameraError.value =
      errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError'
        ? 'permission_denied'
        : 'unavailable'
  }
}

function emitBase64(dataUrlOrBase64: string) {
  const base64 = dataUrlOrBase64.includes(',') ? dataUrlOrBase64.split(',')[1] : dataUrlOrBase64
  if (base64) {
    emit('captured', base64)
  }
}

function captureFromCamera() {
  if (props.busy || !videoRef.value || !canvasRef.value) return

  const video = videoRef.value
  const canvas = canvasRef.value
  const width = video.videoWidth || 960
  const height = video.videoHeight || 1280
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) return

  context.drawImage(video, 0, 0, width, height)
  emitBase64(canvas.toDataURL('image/png'))
}

function handleFileChange(event: Event) {
  if (props.busy) return

  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    const result = String(reader.result ?? '')
    emitBase64(result)
  }
  reader.readAsDataURL(file)
}

function useDemoImage() {
  if (props.busy) return
  emit('captured', demoTongueBase64)
}

onMounted(() => {
  void startCamera()
})

onBeforeUnmount(() => {
  stopCamera()
})
</script>

<style scoped>
.capture-panel {
  display: grid;
  gap: 18px;
}

.preview-stage {
  position: relative;
  min-height: 360px;
  overflow: hidden;
  border: 1px solid rgba(168, 132, 132, 0.28);
  border-radius: 28px;
  background:
    radial-gradient(circle at top, rgba(255, 244, 244, 0.95), rgba(244, 233, 228, 0.92)),
    linear-gradient(135deg, rgba(255, 255, 255, 0.78), rgba(233, 221, 217, 0.82));
  box-shadow:
    0 24px 60px rgba(101, 53, 59, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

.preview-stage.ready {
  background: #23171a;
}

video {
  display: block;
  width: 100%;
  height: 360px;
  object-fit: cover;
}

.preview-placeholder {
  display: grid;
  place-items: center;
  gap: 10px;
  height: 360px;
  padding: 24px;
  text-align: center;
}

.preview-placeholder h3 {
  margin: 0;
  color: #5d3138;
  font-size: 28px;
  font-weight: 700;
}

.preview-placeholder p {
  max-width: 420px;
  margin: 0;
  color: #7b5d61;
  line-height: 1.7;
}

.preview-badge {
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(149, 84, 94, 0.12);
  color: #9d5863;
  font-size: 13px;
  letter-spacing: 0.08em;
}

.hidden-canvas {
  display: none;
}

.helper-copy {
  display: flex;
  align-items: center;
}

.helper-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
}

.helper-text.neutral {
  color: #6f565a;
}

.helper-text.warning {
  color: #a63b52;
}

.action-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.action-row button {
  min-height: 48px;
  padding: 0 16px;
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

.action-row button:hover:enabled {
  transform: translateY(-1px);
}

.action-row button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.primary {
  background: linear-gradient(135deg, #a44b5f, #c96d79);
  color: #fffaf9;
  box-shadow: 0 16px 28px rgba(162, 80, 98, 0.24);
}

.secondary {
  background: rgba(164, 75, 95, 0.08);
  border-color: rgba(164, 75, 95, 0.18);
  color: #7e4050;
}

.ghost {
  background: #ffffff;
  border-color: rgba(120, 84, 89, 0.16);
  color: #5d3e44;
}

.upload-card {
  display: grid;
  gap: 6px;
  padding: 18px 20px;
  border: 1px dashed rgba(146, 98, 104, 0.34);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.72);
  cursor: pointer;
}

.upload-card.disabled {
  opacity: 0.56;
  cursor: not-allowed;
}

.upload-card input {
  display: none;
}

.upload-card strong {
  color: #5b343b;
  font-size: 15px;
}

.upload-card span {
  color: #82686d;
  font-size: 13px;
  line-height: 1.6;
}

@media (max-width: 720px) {
  .action-row {
    grid-template-columns: 1fr;
  }
}
</style>
