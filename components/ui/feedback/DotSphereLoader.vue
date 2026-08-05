<template>
  <canvas
    ref="canvasRef"
    class="dot-sphere-loader"
    :width="pixelSize"
    :height="pixelSize"
    :style="{ width: `${size}px`, height: `${size}px` }"
    role="img"
    :aria-label="label"
  />
</template>

<script setup lang="ts">
import { BOOT_CYCLE_SEC } from '~/utils/dotSphereLoader'

const props = withDefaults(
  defineProps<{
    size?: number
    rings?: number
    segments?: number
    color?: string
    
    mode?: 'boot' | 'adaptive' | 'loop'
    cycle?: number
    label?: string
  }>(),
  {
    size: 160,
    rings: 24,
    segments: 36,
    color: '#ffffff',
    mode: 'boot',
    cycle: BOOT_CYCLE_SEC,
    label: 'Загрузка',
  }
)

const emit = defineEmits<{
  ordered: []
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const dpr =
  typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1
const pixelSize = computed(() => Math.round(props.size * dpr))

type Particle = {
  sx: number
  sy: number
  sz: number
  cx: number
  cy: number
  cz: number
  delay: number
  drift: number
  spin: number
}

const particles: Particle[] = []
let rafId = 0
let time = 0
let lastTs = 0
let reducedMotion = false
let angle = 0
let form = 0
let orderedEmitted = false
let finishing = false
let finishFrom = 0
let finishStartedAt = 0
let finishDuration = 0.28
let finishResolve: (() => void) | null = null


const ADAPTIVE_GATHER_SEC = 1.15

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}


function bootForm(localT: number) {
  if (localT < 0.18) return 0
  if (localT < 0.48) return easeInOut((localT - 0.18) / 0.3)
  return 1
}

function scrambleChaos(p: Particle) {
  const theta = Math.random() * Math.PI * 2
  const r = Math.sqrt(Math.random()) * 1.1
  p.cx = Math.cos(theta) * r
  p.cy = Math.sin(theta) * r
  p.cz = rand(-0.35, 0.35) * (1 - r * 0.25)
}

function buildParticles() {
  particles.length = 0
  const rings = props.rings
  const segments = props.segments

  for (let i = 0; i <= rings; i++) {
    const lat = (i / rings) * Math.PI - Math.PI / 2
    const cosLat = Math.cos(lat)
    const sinLat = Math.sin(lat)
    const ringSegments = Math.max(
      6,
      Math.round(segments * Math.max(0.18, Math.abs(cosLat)))
    )
    for (let j = 0; j < ringSegments; j++) {
      const lon = (j / ringSegments) * Math.PI * 2
      const p: Particle = {
        sx: cosLat * Math.cos(lon),
        sy: sinLat,
        sz: cosLat * Math.sin(lon),
        cx: 0,
        cy: 0,
        cz: 0,
        delay: Math.random() * 0.18,
        drift: rand(0.6, 1.8),
        spin: rand(-1.2, 1.2),
      }
      scrambleChaos(p)
      particles.push(p)
    }
  }
}

function currentForm(): number {
  if (reducedMotion) return 1
  if (props.mode === 'loop') return 1
  if (finishing) {
    const t = Math.min(1, (time - finishStartedAt) / Math.max(0.08, finishDuration))
    return finishFrom + (1 - finishFrom) * easeInOut(t)
  }
  if (props.mode === 'adaptive') {

    return easeInOut(Math.min(0.92, time / ADAPTIVE_GATHER_SEC))
  }

  const cycle = Math.max(1.5, props.cycle)
  return bootForm(Math.min(1, time / cycle))
}

function maybeEmitOrdered(value: number) {
  if (orderedEmitted || value < 0.98) return
  orderedEmitted = true
  emit('ordered')
  if (finishResolve) {
    const resolve = finishResolve
    finishResolve = null
    resolve()
  }
}


function finish(): Promise<void> {
  if (reducedMotion || form >= 0.98) {
    form = 1
    maybeEmitOrdered(1)
    return Promise.resolve()
  }
  if (finishing) {
    return new Promise((resolve) => {
      const prev = finishResolve
      finishResolve = () => {
        prev?.()
        resolve()
      }
    })
  }
  finishing = true
  finishFrom = form
  finishStartedAt = time

  finishDuration = 0.18 + (1 - form) * 0.32
  return new Promise((resolve) => {
    finishResolve = resolve
  })
}

function draw(ts: number) {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 0
  lastTs = ts
  if (!reducedMotion) {
    time += dt
    angle += (props.mode === 'loop' ? 0.55 : 0.35) * dt
  }

  form = currentForm()
  maybeEmitOrdered(form)

  const w = canvas.width
  const h = canvas.height
  const cx = w / 2
  const cy = h / 2
  const radius = w * 0.47
  const focal = 2.6
  const tilt = 0.18
  const cosA = Math.cos(angle)
  const sinA = Math.sin(angle)
  const cosT = Math.cos(tilt)
  const sinT = Math.sin(tilt)

  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = props.color
  const baseDot = Math.max(1.05 * dpr, w * 0.007)
  const cycle = Math.max(1.5, props.cycle)

  for (const p of particles) {

    let particleForm = form
    if (props.mode === 'boot' && !finishing) {
      const local = Math.min(1, time / cycle + p.delay * 0.35)
      particleForm = reducedMotion ? 1 : bootForm(local)
    } else if (props.mode === 'adaptive' && !finishing) {
      particleForm = Math.min(1, form + p.delay * 0.08)
    }

    const driftAmp = (1 - particleForm) * 0.1
    const driftT = time * p.drift
    const dx = Math.sin(driftT + p.spin * 3) * driftAmp
    const dy = Math.cos(driftT * 0.85 + p.delay * 8) * driftAmp
    const dz = Math.sin(driftT * 1.1 - p.spin) * driftAmp * 0.6

    let x = p.cx + (p.sx - p.cx) * particleForm + dx
    let y = p.cy + (p.sy - p.cy) * particleForm + dy
    let z = p.cz + (p.sz - p.cz) * particleForm + dz

    if (particleForm < 0.85) {
      const flat = Math.hypot(x, y)
      const maxR = 1.12
      if (flat > maxR) {
        x = (x / flat) * maxR
        y = (y / flat) * maxR
      }
    }

    if (particleForm > 0.2) {
      const mix = (particleForm - 0.2) / 0.8
      const rx = x * cosA - z * sinA
      const rz = x * sinA + z * cosA
      x = x + (rx - x) * mix
      z = z + (rz - z) * mix
    }

    const y2 = y * cosT - z * sinT
    const z2 = y * sinT + z * cosT
    const depth = (z2 + 1.4) * 0.4
    const scale = focal / (focal + z2)
    const sx = cx + x * radius * scale
    const sy = cy + y2 * radius * scale
    const alpha = 0.28 + Math.min(1, Math.max(0, depth)) * 0.72
    const r = baseDot * (0.65 + Math.min(1, Math.max(0, depth)) * 0.55)

    ctx.globalAlpha = alpha
    ctx.beginPath()
    ctx.arc(sx, sy, r, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.globalAlpha = 1
  rafId = window.requestAnimationFrame(draw)
}

function start() {
  buildParticles()
  time = 0
  lastTs = 0
  angle = 0
  form = 0
  orderedEmitted = false
  finishing = false
  finishResolve = null
  if (rafId) window.cancelAnimationFrame(rafId)
  rafId = window.requestAnimationFrame(draw)
}

function stop() {
  if (rafId) window.cancelAnimationFrame(rafId)
  rafId = 0
}

onMounted(() => {
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  start()
})

onUnmounted(stop)

watch(
  () => [props.rings, props.segments, props.size, props.mode],
  () => {
    start()
  }
)

defineExpose({ finish, start })
</script>

<style scoped>
.dot-sphere-loader {
  display: block;
  flex: 0 0 auto;
}
</style>
