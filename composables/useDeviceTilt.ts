import { onMounted, onUnmounted, ref } from 'vue'

type SensorPermissionCtor = {
  requestPermission?: () => Promise<PermissionState>
}

function prefersReducedMotion() {
  if (!import.meta.client) return true
  return (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('no-animations')
  )
}

function clamp(value: number, min = -1, max = 1) {
  return Math.min(max, Math.max(min, value))
}

function sensorCtor(name: 'DeviceOrientationEvent' | 'DeviceMotionEvent') {
  if (!import.meta.client) return null
  const ctor = (globalThis as Record<string, unknown>)[name]
  return typeof ctor === 'function' || typeof ctor === 'object'
    ? (ctor as SensorPermissionCtor)
    : null
}

export function useDeviceTilt() {
  const x = ref(0)
  const y = ref(0)
  const motion = ref(0)

  let raf = 0
  let targetX = 0
  let targetY = 0
  let targetShakeX = 0
  let targetShakeY = 0
  let targetMotion = 0
  let currentX = 0
  let currentY = 0
  let currentShakeX = 0
  let currentShakeY = 0
  let currentMotion = 0
  let listening = false
  let gotOrientation = false

  function tick() {
    currentX += (targetX - currentX) * 0.16
    currentY += (targetY - currentY) * 0.16
    currentShakeX += (targetShakeX - currentShakeX) * 0.28
    currentShakeY += (targetShakeY - currentShakeY) * 0.28
    currentMotion += (targetMotion - currentMotion) * 0.22
    x.value = clamp(currentX + currentShakeX * 0.55)
    y.value = clamp(currentY + currentShakeY * 0.55)
    motion.value = currentMotion
    targetShakeX *= 0.86
    targetShakeY *= 0.86
    targetMotion *= 0.92
    raf = window.requestAnimationFrame(tick)
  }

  function onOrientation(event: { gamma: number | null; beta: number | null }) {
    gotOrientation = true
    const gamma = Number(event.gamma) || 0
    const beta = Number(event.beta) || 0
    targetX = clamp(gamma / 18)
    targetY = clamp((beta - 40) / 28)
  }

  function onMotion(event: {
    acceleration: { x: number | null; y: number | null; z: number | null } | null
    accelerationIncludingGravity: { x: number | null; y: number | null; z: number | null } | null
    rotationRate: { alpha: number | null; beta: number | null; gamma: number | null } | null
  }) {
    const linear = event.acceleration
    const gravity = event.accelerationIncludingGravity
    const accel = linear || gravity
    if (!accel) return

    const magnitude = Math.sqrt(
      (accel.x || 0) ** 2 + (accel.y || 0) ** 2 + (accel.z || 0) ** 2
    )
    const rest = linear ? 0.4 : 9.6
    targetMotion = Math.max(targetMotion, clamp((magnitude - rest) / 4, 0, 1))

    const spin = event.rotationRate
    if (spin) {
      const twist =
        Math.abs(spin.alpha || 0) + Math.abs(spin.beta || 0) + Math.abs(spin.gamma || 0)
      targetMotion = Math.max(targetMotion, clamp(twist / 220, 0, 1))
    }

    const source = linear || gravity
    const divisor = linear ? 4.2 : 7.2
    targetShakeX = clamp((source.x || 0) / divisor)
    targetShakeY = clamp(-(source.y || 0) / divisor)

    if (!gotOrientation && gravity && gravity.x != null && gravity.y != null) {
      targetX = clamp(gravity.x / 7.2)
      targetY = clamp(-(gravity.y || 0) / 7.2)
    }
  }

  async function enableSensors() {
    if (listening || prefersReducedMotion() || !import.meta.client) return
    const orientation = sensorCtor('DeviceOrientationEvent')
    const motionApi = sensorCtor('DeviceMotionEvent')
    if (!orientation && !motionApi) return

    try {
      if (typeof orientation?.requestPermission === 'function') {
        const state = await orientation.requestPermission()
        if (state !== 'granted') return
      }
      if (typeof motionApi?.requestPermission === 'function') {
        await motionApi.requestPermission().catch(() => undefined)
      }
    } catch {
      return
    }

    window.addEventListener('deviceorientation', onOrientation, { passive: true })
    window.addEventListener('devicemotion', onMotion as EventListener, { passive: true })
    listening = true
  }

  function onFirstGesture() {
    void enableSensors()
    window.removeEventListener('pointerdown', onFirstGesture)
  }

  onMounted(() => {
    if (!import.meta.client || prefersReducedMotion()) return
    raf = window.requestAnimationFrame(tick)
    const orientation = sensorCtor('DeviceOrientationEvent')
    if (typeof orientation?.requestPermission === 'function') {
      window.addEventListener('pointerdown', onFirstGesture, { passive: true })
      return
    }
    void enableSensors()
  })

  onUnmounted(() => {
    if (raf) window.cancelAnimationFrame(raf)
    if (!import.meta.client) return
    window.removeEventListener('deviceorientation', onOrientation)
    window.removeEventListener('devicemotion', onMotion as EventListener)
    window.removeEventListener('pointerdown', onFirstGesture)
  })

  return { x, y, motion }
}
