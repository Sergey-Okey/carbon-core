<template>
  <div class="hologram">
    <div v-if="empty" class="hologram__empty">
      <p>Нет сигнала</p>
      <span>Закройте задачи — волна появится из активности</span>
    </div>
    <template v-else>
      <div ref="stageRef" class="hologram__stage">
        <canvas
          ref="canvasRef"
          class="hologram__canvas"
          role="img"
          :aria-label="ariaLabel"
          @pointermove="onPointer"
          @pointerleave="hoverLayer = -1"
        />
      </div>
      <div class="hologram__foot">
        <p class="hologram__caption">{{ caption }}</p>
        <p v-if="hoverDetail" class="hologram__hint">{{ hoverDetail }}</p>
        <ul v-else class="hologram__layers" aria-hidden="true">
          <li v-for="layer in layers" :key="layer.key" :style="{ '--layer': layer.color }">
            {{ layer.label }}
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ActivityDayPoint } from '~/composables/useAnalyticsMetrics'

export type HologramMetric = {
  key: string
  label: string
  value: number
}

const props = withDefaults(
  defineProps<{
    series?: ActivityDayPoint[]
    metrics?: HologramMetric[]
    empty?: boolean
  }>(),
  {
    series: () => [],
    metrics: () => [],
    empty: false,
  }
)

const stageRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const hoverLayer = ref(-1)
const accent = ref('#888888')
const textMuted = ref('rgba(128,128,128,0.45)')

const samples = computed(() => {
  if (props.series.length) return props.series.map((day) => day.count)
  return props.metrics.map((metric) => metric.value / 20)
})

const layers = computed(() => {
  const fromMetrics = props.metrics.slice(0, 4).map((metric, index) => ({
    key: metric.key,
    label: metric.label,
    energy: Math.min(1, Math.max(0.12, metric.value / 100)),
    color: layerColor(index),
  }))
  if (fromMetrics.length) return fromMetrics

  const avg =
    samples.value.reduce((sum, value) => sum + value, 0) / Math.max(samples.value.length, 1)
  const max = Math.max(...samples.value, 1)
  return [
    {
      key: 'pulse',
      label: 'Пульс',
      energy: Math.min(1, avg / max),
      color: layerColor(0),
    },
  ]
})

const caption = computed(() => {
  const total = samples.value.reduce((sum, value) => sum + value, 0)
  if (!total) return 'Сигнал слабый'
  const peak = Math.max(...samples.value, 0)
  return `Пульс · ${total} за период · пик ${peak}`
})

const ariaLabel = computed(() => `Волновая голограмма активности: ${caption.value}`)

const hoverDetail = computed(() => {
  const layer = layers.value[hoverLayer.value]
  if (!layer) return ''
  const metric = props.metrics.find((item) => item.key === layer.key)
  if (metric) return `${metric.label}: ${metric.value}%`
  return `${layer.label}: ${Math.round(layer.energy * 100)}% энергии`
})

function layerColor(index: number) {
  const mixes = [1, 0.72, 0.48, 0.32]
  return `color-mix(in srgb, var(--accent) ${Math.round(mixes[index % mixes.length] * 100)}%, transparent)`
}

function readTheme() {
  if (typeof window === 'undefined') return
  const styles = getComputedStyle(document.documentElement)
  accent.value = styles.getPropertyValue('--accent').trim() || '#888'
  textMuted.value =
    styles.getPropertyValue('--color-text-muted').trim() || 'rgba(128,128,128,0.45)'
}

const colorCache = new Map<string, string>()

function resolveCssColor(value: string, fallback: string) {
  if (typeof document === 'undefined') return fallback
  const cached = colorCache.get(value)
  if (cached) return cached
  if (!value.includes('var(') && !value.includes('color-mix')) {
    colorCache.set(value, value || fallback)
    return value || fallback
  }
  const probe = document.createElement('span')
  probe.style.color = value
  document.body.appendChild(probe)
  const resolved = getComputedStyle(probe).color || fallback
  probe.remove()
  colorCache.set(value, resolved)
  return resolved
}

function refreshColorCache() {
  colorCache.clear()
  layers.value.forEach((layer) => {
    resolveCssColor(layer.color, accent.value)
  })
}

let rafId = 0
let phase = 0
let lastTs = 0
let reducedMotion = false
let dpr = 1

function waveformAt(t: number, layerIndex: number, energy: number) {
  const data = samples.value
  const n = Math.max(data.length, 2)
  const max = Math.max(...data, 1)
  const pos = ((t % 1) + 1) % 1
  const idx = pos * (n - 1)
  const i0 = Math.floor(idx)
  const i1 = Math.min(n - 1, i0 + 1)
  const frac = idx - i0
  const a = (data[i0] ?? 0) / max
  const b = (data[i1] ?? 0) / max
  const sample = a + (b - a) * frac
  const wobble =
    Math.sin(phase * (1.1 + layerIndex * 0.35) + t * Math.PI * 2 * (1.4 + layerIndex * 0.5)) *
    0.12 *
    energy
  return sample * energy + wobble
}

function draw(ts: number) {
  const canvas = canvasRef.value
  const stage = stageRef.value
  if (!canvas || !stage) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 0
  lastTs = ts
  if (!reducedMotion) phase += dt * (0.7 + layers.value.reduce((s, l) => s + l.energy, 0) * 0.35)

  const width = stage.clientWidth
  const height = stage.clientHeight
  const nextW = Math.max(1, Math.floor(width * dpr))
  const nextH = Math.max(1, Math.floor(height * dpr))
  if (canvas.width !== nextW || canvas.height !== nextH) {
    canvas.width = nextW
    canvas.height = nextH
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)

  const midY = height * 0.5
  const amp = height * 0.28
  const list = layers.value
  const step = list.length > 1 ? height * 0.12 : 0

  list.forEach((layer, index) => {
    const offsetY = midY + (index - (list.length - 1) / 2) * step
    const points = 96
    const hot = hoverLayer.value === index
    const dim = hoverLayer.value >= 0 && !hot
    const color = colorCache.get(layer.color) || accent.value
    const coords: { x: number; y: number }[] = []

    for (let i = 0; i <= points; i += 1) {
      const t = i / points
      const x = t * width
      const wave = waveformAt(t + phase * 0.08 * (index + 1), index, layer.energy)
      const y = offsetY - wave * amp * (hot ? 1.18 : 1)
      coords.push({ x, y })
    }

    ctx.beginPath()
    coords.forEach((point, i) => {
      if (i === 0) ctx.moveTo(point.x, point.y)
      else ctx.lineTo(point.x, point.y)
    })
    ctx.strokeStyle = color
    ctx.globalAlpha = dim ? 0.22 : hot ? 0.95 : 0.62
    ctx.lineWidth = hot ? 2.4 : 1.6
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.stroke()

    ctx.beginPath()
    coords.forEach((point, i) => {
      if (i === 0) ctx.moveTo(point.x, point.y)
      else ctx.lineTo(point.x, point.y)
    })
    ctx.lineTo(width, offsetY + amp * 0.35)
    ctx.lineTo(0, offsetY + amp * 0.35)
    ctx.closePath()
    ctx.globalAlpha = dim ? 0.03 : hot ? 0.14 : 0.08
    ctx.fillStyle = color
    ctx.fill()
    ctx.globalAlpha = 1
  })


  ctx.beginPath()
  ctx.moveTo(0, midY)
  ctx.lineTo(width, midY)
  ctx.strokeStyle = resolveCssColor(
    'color-mix(in srgb, var(--color-text-primary) 12%, transparent)',
    textMuted.value
  )
  ctx.lineWidth = 1
  ctx.setLineDash([4, 6])
  ctx.globalAlpha = 0.7
  ctx.stroke()
  ctx.setLineDash([])
  ctx.globalAlpha = 1

  rafId = window.requestAnimationFrame(draw)
}

function onPointer(event: PointerEvent) {
  const stage = stageRef.value
  if (!stage || !layers.value.length) return
  const rect = stage.getBoundingClientRect()
  const y = event.clientY - rect.top
  const midY = rect.height * 0.5
  const step = layers.value.length > 1 ? rect.height * 0.12 : 0
  let best = 0
  let bestDist = Infinity
  layers.value.forEach((_, index) => {
    const offsetY = midY + (index - (layers.value.length - 1) / 2) * step
    const dist = Math.abs(y - offsetY)
    if (dist < bestDist) {
      bestDist = dist
      best = index
    }
  })
  hoverLayer.value = bestDist < rect.height * 0.2 ? best : -1
}

function start() {
  readTheme()
  refreshColorCache()
  if (rafId) window.cancelAnimationFrame(rafId)
  lastTs = 0
  rafId = window.requestAnimationFrame(draw)
}

function stop() {
  if (rafId) window.cancelAnimationFrame(rafId)
  rafId = 0
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  start()
  if (stageRef.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {

    })
    resizeObserver.observe(stageRef.value)
  }
})

onUnmounted(() => {
  stop()
  resizeObserver?.disconnect()
})

watch(
  () => [props.series, props.metrics],
  () => {
    hoverLayer.value = -1
    refreshColorCache()
  },
  { deep: true }
)
</script>

<style scoped lang="scss">
.hologram {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.hologram__empty {
  display: grid;
  place-content: center;
  gap: var(--space-1);
  flex: 1;
  text-align: center;

  p {
    margin: 0;
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
  }

  span {
    color: var(--color-text-muted);
    font-size: var(--text-xs);
  }
}

.hologram__stage {
  position: relative;
  flex: 1 1 auto;
  width: 100%;
  min-height: 0;
  overflow: hidden;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-text-primary) 3%, transparent);
}

.hologram__canvas {
  display: block;
  width: 100%;
  height: 100%;
  cursor: crosshair;
}

.hologram__foot {
  display: grid;
  gap: var(--space-1);
  flex: 0 0 auto;
  min-height: 2.4em;
}

.hologram__caption {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.hologram__hint {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
}

.hologram__layers {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--color-text-muted);
    font-size: var(--text-2xs);
    font-weight: var(--weight-medium);

    &::before {
      content: '';
      width: 10px;
      height: 2px;
      border-radius: var(--radius-full);
      background: var(--layer, var(--accent));
    }
  }
}

@media (max-width: 767px) {
  .hologram__caption,
  .hologram__hint {
    font-size: var(--text-xs);
  }

  .hologram__layers li {
    font-size: var(--text-xs);
  }
}

@media (max-width: 420px) {
  .hologram__layers {
    display: none;
  }
}
</style>
