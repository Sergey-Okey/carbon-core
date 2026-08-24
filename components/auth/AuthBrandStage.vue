<template>
  <aside
    ref="stageEl"
    class="brand-stage"
    @pointermove="onPointerMove"
    @pointerleave="onPointerLeave"
  >
    <canvas
      ref="canvasEl"
      class="brand-stage__canvas"
      aria-hidden="true"
    />
    <div class="brand-stage__copy">
      <p class="brand-stage__mark">COF</p>
      <p class="brand-stage__slogan">
        <span class="brand-stage__slogan-ghost" aria-hidden="true">{{
          slogan
        }}</span>
        <span class="brand-stage__slogan-live">
          <span>{{ typedSlogan }}</span
          ><span class="brand-stage__caret" :class="{ idle: typeDone }" />
        </span>
      </p>
    </div>
  </aside>
</template>

<script setup lang="ts">
const props = defineProps<{
  slogan: string
}>()

const stageEl = ref<HTMLElement | null>(null)
const canvasEl = ref<HTMLCanvasElement | null>(null)
const typedSlogan = ref('')
const typeDone = ref(false)

let typeTimer = 0
let typewriterCancelled = false
let reducedMotion = false

type RingDef = {
  radius: number
  speed: number
  ticks: number
  tickLen: number
  width: number
  alpha: number
  angle: number
}

type Shard = {
  ringIndex: number
  tickIndex: number
  homeAngle: number
  homeRadius: number
  len: number
  width: number
  alpha: number
  /** scatter start (fraction of span / radians) */
  scatterR: number
  scatterA: number
  scatterTilt: number
  /** 0..1 assemble progress for this shard */
  delay: number
  duration: number
}

const DESKTOP_RING_RADII = [0.16, 0.52, 0.92] as const
const MOBILE_RING_RADII = [0.22, 0.58, 0.98] as const

const ringDefs: RingDef[] = [
  { radius: DESKTOP_RING_RADII[0], speed: 0.38, ticks: 56, tickLen: 0.12, width: 2.3, alpha: 0.64, angle: 0 },
  { radius: DESKTOP_RING_RADII[1], speed: -0.28, ticks: 76, tickLen: 0.12, width: 2.3, alpha: 0.5, angle: 0.4 },
  { radius: DESKTOP_RING_RADII[2], speed: 0.2, ticks: 96, tickLen: 0.12, width: 2.3, alpha: 0.4, angle: 1.1 },
]

function isMobileLayout() {
  return cssW > 0 && cssW <= 900
}

function getLayout() {
  if (isMobileLayout()) {
    return {
      cx: cssW * 0.97,
      cy: cssH * 0.42,
      span: Math.max(cssW * 1.45, cssH * 0.78),
      edgeFadeAt: cssW * 0.9,
      edgeFadeRange: Math.max(48, cssW * 0.24),
    }
  }

  return {
    cx: cssW * 0.98,
    cy: cssH * 0.5,
    span: Math.min(cssW, cssH) * 0.92,
    edgeFadeAt: cssW * 0.92,
    edgeFadeRange: Math.max(40, cssW * 0.18),
  }
}

let shards: Shard[] = []
let themeInk = { r: 245, g: 245, b: 245 }
let themeBg = '#050505'
let themeObserver: MutationObserver | null = null

let raf = 0
let dpr = 1
let cssW = 0
let cssH = 0
let lastTs = 0
let assembleT = 0
let pointerX = -9999
let pointerY = -9999
let pointerActive = false
let resizeObs: ResizeObserver | null = null

function hash(n: number) {
  return ((n * 2654435761) >>> 0) / 4294967296
}

function easeInCubic(t: number) {
  const u = Math.min(1, Math.max(0, t))
  return u * u * u
}

function parseRgb(color: string) {
  const ctx = document.createElement('canvas').getContext('2d')
  if (!ctx) return { r: 214, g: 214, b: 214 }
  ctx.fillStyle = color
  const computed = ctx.fillStyle
  if (computed.startsWith('#')) {
    const h = computed.slice(1)
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
    const n = Number.parseInt(full, 16)
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
  }
  const m = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!m) return { r: 214, g: 214, b: 214 }
  return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) }
}

function syncThemeColors() {
  const stage = stageEl.value
  if (!stage) return
  const styles = getComputedStyle(stage)
  themeBg = styles.getPropertyValue('--brand-stage-bg').trim() || styles.backgroundColor
  const ink = styles.getPropertyValue('--brand-ink').trim() || styles.color
  themeInk = parseRgb(ink)
}

function rebuildShards() {
  shards = []
  let order = 0
  const mobile = isMobileLayout()
  const radii = mobile ? MOBILE_RING_RADII : DESKTOP_RING_RADII
  const tickScale = mobile ? 2.8 : 1.7
  const tickCounts = mobile ? [48, 64, 80] : [56, 76, 96]

  ringDefs.forEach((ring, ringIndex) => {
    const ticks = tickCounts[ringIndex] || ring.ticks
    const homeRadius = radii[ringIndex] || ring.radius

    for (let i = 0; i < ticks; i += 1) {
      const homeAngle = (i / ticks) * Math.PI * 2
      const n = hash(ringIndex * 1009 + i * 17 + 3)
      const n2 = hash(ringIndex * 503 + i * 41 + 9)
      const n3 = hash(ringIndex * 307 + i * 23 + 1)

      const delay = ringIndex * 0.08 + order * 0.003
      order += 1

      shards.push({
        ringIndex,
        tickIndex: i,
        homeAngle,
        homeRadius,
        len: ring.tickLen * tickScale,
        width: mobile ? Math.max(2, ring.width * 0.92) : ring.width,
        alpha: ring.alpha * (0.82 + n3 * 0.2),
        scatterR: 0.95 + n * 0.55 + ringIndex * 0.08,
        scatterA: homeAngle + (n2 - 0.5) * 1.8,
        scatterTilt: (n3 - 0.5) * 1.4,
        delay,
        duration: 0.28 + n * 0.18,
      })
    }
  })
}

async function sleep(ms: number) {
  await new Promise((resolve) => {
    typeTimer = window.setTimeout(resolve, ms)
  })
}

async function typeText(text: string, speed = 42) {
  for (let i = 1; i <= text.length; i += 1) {
    typedSlogan.value = text.slice(0, i)
    await sleep(speed)
  }
}

async function deleteText(speed = 28) {
  while (typedSlogan.value.length > 0) {
    typedSlogan.value = typedSlogan.value.slice(0, -1)
    await sleep(speed)
  }
}

async function runTypewriter() {
  if (reducedMotion) {
    typedSlogan.value = props.slogan
    typeDone.value = true
    return
  }

  while (!typewriterCancelled) {
    typedSlogan.value = ''
    typeDone.value = false
    await sleep(280)
    if (typewriterCancelled) break
    await typeText('В хаосе…', 50)
    await sleep(420)
    if (typewriterCancelled) break
    await deleteText(24)
    await sleep(180)
    if (typewriterCancelled) break
    await typeText(props.slogan, 38)
    typeDone.value = true
    await sleep(2200)
  }
}

function resizeCanvas() {
  const stage = stageEl.value
  const canvas = canvasEl.value
  if (!stage || !canvas) return

  const rect = stage.getBoundingClientRect()
  cssW = Math.max(1, Math.round(rect.width))
  cssH = Math.max(1, Math.round(rect.height))
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.style.width = `${cssW}px`
  canvas.style.height = `${cssH}px`
  canvas.width = Math.round(cssW * dpr)
  canvas.height = Math.round(cssH * dpr)
  const ctx = canvas.getContext('2d')
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  syncThemeColors()
  rebuildShards()
}

function onPointerMove(event: PointerEvent) {
  const stage = stageEl.value
  if (!stage || reducedMotion) return
  const rect = stage.getBoundingClientRect()
  pointerX = event.clientX - rect.left
  pointerY = event.clientY - rect.top
  pointerActive = true
}

function onPointerLeave() {
  pointerActive = false
  pointerX = -9999
  pointerY = -9999
}

function ink(a: number) {
  return `rgba(${themeInk.r}, ${themeInk.g}, ${themeInk.b}, ${a.toFixed(3)})`
}

function shardProgress(shard: Shard) {
  const localT = (assembleT - shard.delay) / shard.duration
  if (localT <= 0) return 0
  if (localT >= 1) return 1
  return easeInCubic(localT)
}

function tick(now: number) {
  const canvas = canvasEl.value
  const ctx = canvas?.getContext('2d')
  if (!canvas || !ctx || cssW <= 0) {
    raf = requestAnimationFrame(tick)
    return
  }

  const dt = lastTs ? Math.min(0.033, (now - lastTs) / 1000) : 0.016
  lastTs = now
  assembleT += dt

  const { cx, cy, span, edgeFadeAt, edgeFadeRange } = getLayout()
  const ringsAssembled = assembleT > 0.85

  ctx.clearRect(0, 0, cssW, cssH)
  ctx.fillStyle = themeBg
  ctx.fillRect(0, 0, cssW, cssH)

  ringDefs.forEach((ring) => {
    let spin = ring.speed * (ringsAssembled ? 1 : 0.18)
    if (pointerActive && ringsAssembled) {
      const baseR = ring.radius * span
      const pointerDist = Math.hypot(pointerX - cx, pointerY - cy)
      const nearRing = Math.max(0, 1 - Math.abs(pointerDist - baseR) / (span * 0.12))
      spin *= 1 - nearRing * 0.92
    }
    ring.angle += spin * dt
  })

  let pointerAngle = 0
  let pointerDist = 0
  if (pointerActive) {
    pointerAngle = Math.atan2(pointerY - cy, pointerX - cx)
    pointerDist = Math.hypot(pointerX - cx, pointerY - cy)
  }

  for (const shard of shards) {
    const ring = ringDefs[shard.ringIndex]!
    const p = shardProgress(shard)

    const homeA = shard.homeAngle + ring.angle
    const scatterA = shard.scatterA
    const scatterR = shard.scatterR * span
    const homeR = shard.homeRadius * span

    const a = scatterA + (homeA - scatterA) * p
    const r = scatterR + (homeR - scatterR) * p
    const tilt = shard.scatterTilt * (1 - p)

    let push = 0
    let bright = 0
    if (pointerActive && p > 0.95) {
      let da = a - pointerAngle
      while (da > Math.PI) da -= Math.PI * 2
      while (da < -Math.PI) da += Math.PI * 2
      const angular = Math.max(0, 1 - Math.abs(da) / 0.55)
      const nearRing = Math.max(0, 1 - Math.abs(pointerDist - homeR) / (span * 0.16))
      const influence = angular * angular * (0.35 + nearRing * 0.65)
      push = influence * span * 0.1
      bright = influence
    }

    const dir = a + tilt
    const r0 = r + push * 0.15
    const r1 = r + shard.len * span + push
    const x0 = cx + Math.cos(dir) * r0
    const y0 = cy + Math.sin(dir) * r0
    const x1 = cx + Math.cos(dir) * r1
    const y1 = cy + Math.sin(dir) * r1

    const midX = (x0 + x1) * 0.5
    const edgeFade = Math.max(0, Math.min(1, (edgeFadeAt - midX) / edgeFadeRange))
    const appear = p <= 0 ? 0 : Math.min(1, 0.25 + p * 0.75)
    const alpha = Math.min(0.95, (shard.alpha * appear + bright * 0.65) * edgeFade)

    if (alpha < 0.02) continue

    if (p > 0 && p < 1) {
      const trail = (1 - p) * shard.len * span * 1.8
      const tx = x0 - Math.cos(dir) * trail
      const ty = y0 - Math.sin(dir) * trail
      const grad = ctx.createLinearGradient(tx, ty, x1, y1)
      grad.addColorStop(0, ink(0))
      grad.addColorStop(0.55, ink(alpha * 0.35))
      grad.addColorStop(1, ink(alpha))
      ctx.strokeStyle = grad
      ctx.lineWidth = shard.width * (0.7 + p * 0.5)
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(tx, ty)
      ctx.lineTo(x1, y1)
      ctx.stroke()
    } else {
      ctx.beginPath()
      ctx.moveTo(x0, y0)
      ctx.lineTo(x1, y1)
      ctx.strokeStyle = ink(alpha)
      ctx.lineWidth = shard.width + bright * 1.2
      ctx.lineCap = 'round'
      ctx.stroke()
    }
  }

  raf = requestAnimationFrame(tick)
}

function startCanvas() {
  lastTs = 0
  assembleT = 0
  resizeCanvas()
  if (raf) cancelAnimationFrame(raf)
  raf = requestAnimationFrame(tick)
}

function stopCanvas() {
  if (raf) cancelAnimationFrame(raf)
  raf = 0
  resizeObs?.disconnect()
  resizeObs = null
  themeObserver?.disconnect()
  themeObserver = null
}

function drawStatic() {
  resizeCanvas()
  const canvas = canvasEl.value
  const ctx = canvas?.getContext('2d')
  if (!ctx || cssW <= 0) return
  const { cx, cy, span, edgeFadeAt, edgeFadeRange } = getLayout()
  ctx.fillStyle = themeBg
  ctx.fillRect(0, 0, cssW, cssH)
  for (const shard of shards) {
    const a = shard.homeAngle
    const r0 = shard.homeRadius * span
    const r1 = r0 + shard.len * span
    const x0 = cx + Math.cos(a) * r0
    const x1 = cx + Math.cos(a) * r1
    const midX = (x0 + x1) * 0.5
    const edgeFade = Math.max(0, Math.min(1, (edgeFadeAt - midX) / edgeFadeRange))
    if (edgeFade < 0.02) continue
    ctx.beginPath()
    ctx.moveTo(x0, cy + Math.sin(a) * r0)
    ctx.lineTo(x1, cy + Math.sin(a) * r1)
    ctx.strokeStyle = ink(shard.alpha * edgeFade)
    ctx.lineWidth = shard.width
    ctx.lineCap = 'round'
    ctx.stroke()
  }
}

onMounted(() => {
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  syncThemeColors()
  void runTypewriter()

  themeObserver = new MutationObserver(() => {
    syncThemeColors()
    if (reducedMotion) drawStatic()
  })
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })

  if (reducedMotion) {
    drawStatic()
    return
  }

  startCanvas()
  if (stageEl.value && typeof ResizeObserver !== 'undefined') {
    resizeObs = new ResizeObserver(() => resizeCanvas())
    resizeObs.observe(stageEl.value)
  }
})

onBeforeUnmount(() => {
  typewriterCancelled = true
  if (typeTimer) window.clearTimeout(typeTimer)
  stopCanvas()
})
</script>

<style scoped lang="scss">
.brand-stage {
  --brand-inset: var(--space-4);
  --brand-stage-bg: var(--color-bg);
  --brand-ink: var(--color-text-primary);
  --brand-muted: var(--color-text-secondary);
  position: relative;
  display: block;
  min-height: 0;
  height: 100%;
  overflow: hidden;
  border-radius: inherit;
  background: var(--brand-stage-bg);
  color: var(--brand-ink);
  transition:
    background var(--transition-standard, 0.2s ease),
    color var(--transition-standard, 0.2s ease);
}

.brand-stage__canvas {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
}

.brand-stage__copy {
  position: absolute;
  z-index: 3;
  left: max(var(--brand-inset), env(safe-area-inset-left, 0px));
  bottom: max(var(--brand-inset), env(safe-area-inset-bottom, 0px));
  display: grid;
  justify-items: start;
  gap: var(--space-2);
  width: min(calc(100% - 2 * var(--brand-inset)), 42ch);
  max-width: calc(100% - 2 * var(--brand-inset));
  text-align: left;
  pointer-events: none;
}

.brand-stage__mark {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(5.2rem, 11vw, 8.5rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 0.96;
  color: var(--brand-ink);
  text-align: left;
  -webkit-text-stroke: 0.05em currentColor;
  paint-order: stroke fill;
}

.brand-stage__slogan {
  position: relative;
  margin: 0;
  min-width: 0;
  width: 100%;
  font-family: 'Manrope', var(--font-sans);
  font-size: 14px;
  font-weight: var(--weight-medium);
  letter-spacing: 0.01em;
  line-height: var(--leading-normal);
  color: var(--brand-muted);
  text-align: left;
  word-break: normal;
  hyphens: none;
}

.brand-stage__slogan-ghost {
  display: block;
  visibility: hidden;
  white-space: normal;
}

.brand-stage__slogan-live {
  position: absolute;
  inset: 0;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  overflow: hidden;
}

.brand-stage__caret {
  display: inline-block;
  width: 0.08em;
  height: 1em;
  margin-left: 0.08em;
  background: var(--brand-ink);
  animation: caret-blink 1s steps(1) infinite;

  &.idle {
    opacity: 0;
    animation: none;
  }
}

@keyframes caret-blink {
  0%,
  45% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
}

@media (max-width: 900px) {
  .brand-stage {
    --brand-inset: var(--space-3);
  }

  .brand-stage__copy {
    left: max(var(--brand-inset), env(safe-area-inset-left, 0px));
    right: max(var(--brand-inset), env(safe-area-inset-right, 0px));
    bottom: max(var(--brand-inset), env(safe-area-inset-bottom, 0px));
    top: auto;
    width: auto;
    max-width: none;
    padding-top: var(--space-3);
    background: linear-gradient(
      to top,
      color-mix(in srgb, var(--brand-stage-bg) 88%, transparent) 35%,
      transparent
    );
  }

  .brand-stage__mark {
    font-size: clamp(3.8rem, 18vw, 5.6rem);
    -webkit-text-stroke: 0.055em currentColor;
  }

  .brand-stage__slogan {
    font-size: var(--text-sm);
    max-width: 28ch;
  }
}

@media (prefers-reduced-motion: reduce) {
  .brand-stage__caret {
    display: none;
  }
}
</style>
