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
    <div class="brand-stage__veil" aria-hidden="true" />
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
  
  scatterR: number
  scatterA: number
  scatterTilt: number
  delay: number
  duration: number
}

const ringDefs: RingDef[] = [
  { radius: 0.28, speed: 0.22, ticks: 72, tickLen: 0.042, width: 2.2, alpha: 0.64, angle: 0 },
  { radius: 0.52, speed: -0.16, ticks: 96, tickLen: 0.048, width: 2.4, alpha: 0.5, angle: 0.4 },
  { radius: 0.78, speed: 0.11, ticks: 120, tickLen: 0.054, width: 2.6, alpha: 0.4, angle: 1.1 },
]

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

let hoverStrength = 0
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

  ringDefs.forEach((ring, ringIndex) => {
    for (let i = 0; i < ring.ticks; i += 1) {
      const homeAngle = (i / ring.ticks) * Math.PI * 2
      const n = hash(ringIndex * 1009 + i * 17 + 3)
      const n2 = hash(ringIndex * 503 + i * 41 + 9)
      const n3 = hash(ringIndex * 307 + i * 23 + 1)
      const lenMul = 0.75 + n * 0.55
      const widthMul = 0.85 + n2 * 1.2


      const delay = ringIndex * 0.42 + i * 0.01

      shards.push({
        ringIndex,
        tickIndex: i,
        homeAngle,
        homeRadius: ring.radius,
        len: ring.tickLen * lenMul,
        width: Math.max(1.5, ring.width * widthMul),
        alpha: ring.alpha * (0.75 + n3 * 0.4),
        scatterR: 0.95 + n * 0.55 + ringIndex * 0.08,
        scatterA: homeAngle + (n2 - 0.5) * 1.8,
        scatterTilt: (n3 - 0.5) * 1.4,
        delay,
        duration: 0.55 + n * 0.35,
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

}

function ink(a: number) {
  return `rgba(${themeInk.r}, ${themeInk.g}, ${themeInk.b}, ${a.toFixed(3)})`
}


function leftFacing(angle: number) {
  return -Math.cos(angle)
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

  const cx = cssW
  const cy = cssH * 0.5
  const span = cssW


  const hoverTarget = pointerActive ? 1 : 0
  hoverStrength += (hoverTarget - hoverStrength) * Math.min(1, dt * 10)

  ctx.clearRect(0, 0, cssW, cssH)
  ctx.fillStyle = themeBg
  ctx.fillRect(0, 0, cssW, cssH)

  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, span * 0.22)
  core.addColorStop(0, ink(0.12))
  core.addColorStop(1, ink(0))
  ctx.fillStyle = core
  ctx.beginPath()
  ctx.arc(cx, cy, span * 0.22, 0, Math.PI * 2)
  ctx.fill()

  let pointerAngle = 0
  let pointerDist = 0
  if (pointerActive || hoverStrength > 0.02) {
    pointerAngle = Math.atan2(pointerY - cy, pointerX - cx)
    pointerDist = Math.hypot(pointerX - cx, pointerY - cy)
  }


  let activeRing = -1
  let activeRingNear = 0
  if (hoverStrength > 0.02) {
    let best = 0
    ringDefs.forEach((ring, i) => {
      const baseR = ring.radius * span

      const near = Math.max(0, 1 - Math.abs(pointerDist - baseR) / (span * 0.07))
      if (near > best) {
        best = near
        activeRing = i
        activeRingNear = near
      }
    })
    if (best < 0.15) {
      activeRing = -1
      activeRingNear = 0
    }
  }


  ringDefs.forEach((ring, ringIndex) => {
    const ringReady = assembleT > ringIndex * 0.42 + 0.8
    let spin = ring.speed * (ringReady ? 1 : 0.15)
    if (ringReady && ringIndex === activeRing && activeRingNear > 0) {
      spin *= 1 - activeRingNear * hoverStrength * 0.95
    }
    ring.angle += spin * dt
  })

  for (const shard of shards) {
    const ring = ringDefs[shard.ringIndex]!
    const localT = (assembleT - shard.delay) / shard.duration
    const p = localT <= 0 ? 0 : localT >= 1 ? 1 : easeInCubic(localT)

    const homeA = shard.homeAngle + ring.angle
    const scatterA = shard.scatterA
    const scatterR = shard.scatterR * span
    const homeR = shard.homeRadius * span

    let a = scatterA + (homeA - scatterA) * p
    const rBase = scatterR + (homeR - scatterR) * p
    const tilt = shard.scatterTilt * (1 - p)


    let facing = leftFacing(a + tilt)
    if (facing < -0.08 && p >= 1) continue

    let push = 0
    let spread = 0
    let bright = 0

    if (
      hoverStrength > 0.02 &&
      p > 0.75 &&
      shard.ringIndex === activeRing &&
      activeRingNear > 0
    ) {
      let da = a - pointerAngle
      while (da > Math.PI) da -= Math.PI * 2
      while (da < -Math.PI) da += Math.PI * 2

      const angular = Math.max(0, 1 - Math.abs(da) / 0.38)
      const influence =
        angular *
        angular *
        activeRingNear *
        hoverStrength *
        Math.min(1, (p - 0.75) / 0.25)

      push = influence * span * 0.1
      spread = Math.sign(da || 1) * influence * 0.22
      bright = influence
      a += spread
    }

    const dir = a + tilt
    facing = leftFacing(dir)
    if (facing < -0.08) continue
    const edgeFade = facing < 0.12 ? Math.max(0, (facing + 0.08) / 0.2) : 1

    const r0 = rBase + push * 0.2
    const r1 = rBase + shard.len * span + push
    const x0 = cx + Math.cos(dir) * r0
    const y0 = cy + Math.sin(dir) * r0
    const x1 = cx + Math.cos(dir) * r1
    const y1 = cy + Math.sin(dir) * r1

    const appear = p <= 0 ? 0 : Math.min(1, 0.25 + p * 0.75)
    const alpha = Math.min(
      0.98,
      (shard.alpha * appear + bright * 0.75) * edgeFade
    )
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
      ctx.lineWidth = shard.width + bright * 1.6
      ctx.lineCap = 'round'
      ctx.stroke()
    }

    if (bright > 0.35) {
      const gx = cx + Math.cos(dir) * (r0 + (r1 - r0) * 0.55)
      const gy = cy + Math.sin(dir) * (r0 + (r1 - r0) * 0.55)
      const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, 18)
      glow.addColorStop(0, ink(bright * 0.55))
      glow.addColorStop(1, ink(0))
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(gx, gy, 18, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  ctx.beginPath()
  ctx.arc(cx - 1, cy, 3.4, 0, Math.PI * 2)
  ctx.fillStyle = ink(0.85)
  ctx.fill()

  raf = requestAnimationFrame(tick)
}

function startCanvas() {
  lastTs = 0
  assembleT = 0
  hoverStrength = 0
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
  const cx = cssW
  const cy = cssH * 0.5
  const span = cssW
  ctx.fillStyle = themeBg
  ctx.fillRect(0, 0, cssW, cssH)
  for (const shard of shards) {
    const a = shard.homeAngle
    if (leftFacing(a) < 0) continue
    const r0 = shard.homeRadius * span
    const r1 = r0 + shard.len * span
    const x1 = cx + Math.cos(a) * r1
    const y1 = cy + Math.sin(a) * r1
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0)
    ctx.lineTo(x1, y1)
    ctx.strokeStyle = ink(shard.alpha)
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
  border: 1px solid var(--color-border);
  transition:
    background var(--transition-standard, 0.2s ease),
    color var(--transition-standard, 0.2s ease),
    border-color var(--transition-standard, 0.2s ease);
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

.brand-stage__veil {
  display: none;
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

  .brand-stage__veil {
    display: block;
    position: absolute;
    z-index: 2;
    left: 0;
    right: 0;
    bottom: 0;
    height: min(48%, 20rem);
    pointer-events: none;
    background: linear-gradient(
      to top,
      color-mix(in srgb, var(--brand-stage-bg) 82%, transparent) 0%,
      color-mix(in srgb, var(--brand-stage-bg) 48%, transparent) 45%,
      color-mix(in srgb, var(--brand-stage-bg) 14%, transparent) 78%,
      transparent 100%
    );
    backdrop-filter: blur(18px) saturate(1.05);
    -webkit-backdrop-filter: blur(18px) saturate(1.05);
    mask-image: linear-gradient(
      to top,
      #000 0%,
      #000 40%,
      rgba(0, 0, 0, 0.55) 72%,
      transparent 100%
    );
    -webkit-mask-image: linear-gradient(
      to top,
      #000 0%,
      #000 40%,
      rgba(0, 0, 0, 0.55) 72%,
      transparent 100%
    );
  }

  .brand-stage__copy {
    left: max(var(--brand-inset), env(safe-area-inset-left, 0px));
    bottom: max(var(--brand-inset), env(safe-area-inset-bottom, 0px));
    top: calc(
      max(var(--brand-inset), env(safe-area-inset-top, 0px)) +
        var(--control-icon-size) + var(--space-2)
    );
    align-content: end;
  }

  .brand-stage__mark {
    font-size: clamp(4.4rem, 22vw, 6.5rem);
    -webkit-text-stroke: 0.055em currentColor;
  }

  .brand-stage__slogan {
    font-size: var(--text-md);
  }
}

@media (prefers-reduced-motion: reduce) {
  .brand-stage__caret {
    display: none;
  }
}
</style>
