<template>
  <section class="camera-preview">
    <header class="camera-preview__header">
      <p class="camera-preview__eyebrow">第四步：舌象采集</p>
      <div class="camera-preview__header-copy">
        <h3>摄像头实时预览</h3>
        <p>请保持稳定，让舌面位于取景中央并保持光线均匀。</p>
      </div>
    </header>

    <div class="preview-stage" :class="{ ready: cameraStatus === 'ready' }">
      <video
        v-show="cameraStatus === 'ready'"
        ref="videoRef"
        autoplay
        muted
        playsinline
      />

      <div v-if="cameraStatus !== 'ready'" class="preview-placeholder">
        <span class="preview-badge">{{ statusBadge }}</span>
        <h4>{{ previewTitle }}</h4>
        <p>{{ previewDescription }}</p>
      </div>

      <div v-else class="preview-overlay">
        <span class="preview-badge">实时画面</span>
        <p>请保持稳定</p>
      </div>

      <canvas ref="canvasRef" class="hidden-canvas" />
    </div>

    <p class="helper-text" :class="helperToneClass">
      {{ helperText }}
    </p>

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
const cameraError = ref<'' | 'permission_denied' | 'unavailable' | 'timeout'>('')
const CAMERA_START_TIMEOUT_MS = 8000

let activeStartRequestId = 0

const previewTitle = computed(() => {
  if (cameraStatus.value === 'starting') return '正在准备摄像头'
  if (cameraError.value === 'permission_denied') return '摄像头权限未开启'
  if (cameraError.value === 'unavailable') return '当前无法使用摄像头'
  if (cameraError.value === 'timeout') return '摄像头启动超时'
  return '准备采集实时舌象'
})

const previewDescription = computed(() => {
  if (cameraStatus.value === 'starting') return '建立视频流后即可直接拍照采集'
  if (cameraError.value === 'permission_denied') return '你仍然可以改用上传图片或示例舌象图继续流程'
  if (cameraError.value === 'unavailable') return '这通常发生在无摄像头设备、虚拟机或浏览器禁用了媒体能力时'
  if (cameraError.value === 'timeout') return '请检查授权弹窗、系统相机占用，或点击重新开启摄像头再次尝试'
  return '系统会优先尝试调用本机摄像头，也支持上传图片或示例图兜底'
})

const statusBadge = computed(() => {
  if (cameraStatus.value === 'starting') return '启动中'
  if (cameraError.value === 'permission_denied') return '等待授权'
  if (cameraError.value === 'unavailable') return '不可用'
  if (cameraError.value === 'timeout') return '已超时'
  return '摄像头'
})

const helperText = computed(() => {
  if (cameraStatus.value === 'starting') return '正在连接摄像头，请稍候'
  if (cameraError.value === 'permission_denied') return '请允许摄像头权限后重试'
  if (cameraError.value === 'unavailable') return '未检测到可用摄像头，请上传本地照片或使用示例图继续测试'
  if (cameraError.value === 'timeout') return '摄像头启动超时，请检查浏览器授权、设备占用后重试'
  return '请保持稳定，让舌面居中、光线均匀，避免逆光和明显阴影'
})

const helperToneClass = computed(() => ({
  'helper-text--warning': cameraError.value !== '',
}))

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

  const requestId = ++activeStartRequestId
  stopCamera()
  cameraStatus.value = 'starting'
  cameraError.value = ''

  const timeoutId = window.setTimeout(() => {
    if (requestId !== activeStartRequestId || cameraStatus.value !== 'starting') return

    cameraStatus.value = 'error'
    cameraError.value = 'timeout'
  }, CAMERA_START_TIMEOUT_MS)

  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 960 },
      },
    })

    if (requestId !== activeStartRequestId) {
      mediaStream.getTracks().forEach((track) => track.stop())
      return
    }

    streamRef.value = mediaStream
    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream
      await Promise.resolve(videoRef.value.play())
    }
    cameraStatus.value = 'ready'
  } catch (error) {
    if (requestId !== activeStartRequestId) return

    const errorName =
      typeof error === 'object' && error && 'name' in error ? String(error.name) : ''
    cameraStatus.value = 'error'
    cameraError.value =
      errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError'
        ? 'permission_denied'
        : 'unavailable'
  } finally {
    window.clearTimeout(timeoutId)
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
  activeStartRequestId += 1
  stopCamera()
})
</script>

<style scoped>
.camera-preview {
  display: grid;
  gap: 18px;
}

.camera-preview__header {
  display: grid;
  gap: 10px;
}

.camera-preview__eyebrow {
  margin: 0;
  width: fit-content;
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  background: rgba(181, 91, 109, 0.12);
  color: var(--patient-accent);
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.camera-preview__header-copy {
  display: grid;
  gap: 6px;
}

.camera-preview__header-copy h3,
.camera-preview__header-copy p {
  margin: 0;
}

.camera-preview__header-copy h3 {
  color: var(--patient-text-strong);
  font-size: clamp(1.3rem, 3vw, 1.65rem);
}

.camera-preview__header-copy p {
  color: var(--patient-text-muted);
  line-height: 1.7;
}

.preview-stage {
  position: relative;
  min-height: 360px;
  overflow: hidden;
  border: 1px solid rgba(181, 91, 109, 0.16);
  border-radius: 28px;
  background:
    radial-gradient(circle at top, rgba(255, 246, 241, 0.98), rgba(247, 236, 231, 0.92)),
    linear-gradient(140deg, rgba(255, 255, 255, 0.86), rgba(238, 225, 221, 0.82));
  box-shadow:
    0 20px 48px rgba(111, 59, 69, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

.preview-stage.ready {
  background: linear-gradient(180deg, #24171b 0%, #140d10 100%);
}

video {
  display: block;
  width: 100%;
  height: 360px;
  object-fit: cover;
}

.preview-placeholder,
.preview-overlay {
  position: absolute;
  inset: 0;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 12px;
  padding: 28px;
  text-align: center;
}

.preview-overlay {
  align-content: space-between;
  justify-items: stretch;
  pointer-events: none;
}

.preview-overlay p {
  margin: 0;
  justify-self: start;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  background: rgba(15, 8, 10, 0.5);
  color: rgba(255, 250, 249, 0.96);
  font-weight: 600;
}

.preview-badge {
  display: inline-flex;
  width: fit-content;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  background: rgba(181, 91, 109, 0.14);
  color: var(--patient-accent);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.preview-placeholder h4,
.preview-placeholder p {
  margin: 0;
}

.preview-placeholder h4 {
  color: var(--patient-text-strong);
  font-size: 1.3rem;
}

.preview-placeholder p {
  max-width: 28rem;
  color: var(--patient-text-muted);
  line-height: 1.7;
}

.helper-text {
  margin: 0;
  padding: 0.9rem 1rem;
  border-radius: 18px;
  background: rgba(255, 252, 251, 0.92);
  border: 1px solid rgba(181, 91, 109, 0.12);
  color: var(--patient-text-muted);
  line-height: 1.7;
}

.helper-text--warning {
  background: rgba(255, 248, 240, 0.96);
  border-color: rgba(168, 106, 63, 0.22);
  color: var(--patient-warning);
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.action-row button {
  min-height: 46px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid transparent;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
}

.action-row button:disabled,
.upload-card.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.primary {
  background: linear-gradient(135deg, #a44b5f, #c96d79);
  color: #fffaf9;
}

.secondary {
  background: rgba(255, 252, 251, 0.92);
  border-color: rgba(181, 91, 109, 0.16);
  color: var(--patient-text-strong);
}

.ghost {
  background: rgba(255, 248, 245, 0.82);
  border-color: rgba(181, 91, 109, 0.12);
  color: var(--patient-accent);
}

.upload-card {
  display: grid;
  gap: 6px;
  padding: 1rem 1.1rem;
  border: 1px dashed rgba(181, 91, 109, 0.28);
  border-radius: 20px;
  background: rgba(255, 252, 251, 0.9);
  color: var(--patient-text-muted);
}

.upload-card strong {
  color: var(--patient-text-strong);
}

.upload-card input {
  width: 100%;
}

.hidden-canvas {
  display: none;
}

@media (max-width: 720px) {
  .preview-stage,
  video {
    min-height: 300px;
    height: 300px;
  }

  .action-row {
    flex-direction: column;
  }

  .action-row button {
    width: 100%;
  }
}
</style>
