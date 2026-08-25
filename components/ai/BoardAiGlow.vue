<template>
  <div
    class="board-ai-glow"
    :style="glowStyle"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
const {
  activitySeries,
  currentStreak,
  level,
  levelProgressPercent,
  focusScore,
} = useAnalyticsMetrics()
const tilt = useDeviceTilt()

const todayCount = computed(
  () => activitySeries.value.find((day) => day.isToday)?.count ?? 0
)

const intensity = computed(() => {
  const focus = focusScore.value / 100
  const progress = levelProgressPercent.value / 100
  const today = Math.min(1, todayCount.value / 12)
  const shake = Math.abs(tilt.motion.value) * 0.28
  return 0.62 + focus * 0.22 + progress * 0.1 + today * 0.1 + shake
})

const speed = computed(() => {
  const next =
    8.4 -
    Math.min(currentStreak.value, 10) * 0.22 -
    Math.min(todayCount.value, 12) * 0.08
  return `${Math.max(5.6, next)}s`
})

const glowHeight = computed(() => {
  const extra = Math.min(220, level.value * 12 + todayCount.value * 8)
  const shake = Math.abs(tilt.motion.value) * 80
  return `min(118dvh, ${720 + extra + shake}px)`
})

const glowStyle = computed(() => {
  const x = tilt.x.value
  const y = tilt.y.value
  const shake = Math.abs(tilt.motion.value)
  return {
    '--glow-intensity': Math.min(1, intensity.value).toFixed(3),
    '--glow-speed': speed.value,
    '--glow-height': glowHeight.value,
    '--glow-x': `${50 + x * 36}%`,
    '--glow-y': `${-2 + y * 28}%`,
    '--glow-left': `${12 + x * 22}%`,
    '--glow-right': `${88 + x * 22}%`,
    '--glow-shift-x': `${x * 56}px`,
    '--glow-shift-y': `${y * 42}px`,
    '--glow-scale': (1.04 + shake * 0.08).toFixed(3),
  }
})
</script>

<style scoped lang="scss">
.board-ai-glow {
  display: none;
  pointer-events: none;
}

@include mobile {
  .board-ai-glow {
    display: block;
    position: absolute;
    inset-inline: calc(-1 * var(--space-12));
    inset-block-start: calc(-1 * var(--space-8));
    z-index: 0;
    width: calc(100% + var(--space-12) * 2);
    height: var(--glow-height, min(118dvh, 860px));
    overflow: hidden;
    pointer-events: none;
    opacity: 0;
    background:
      radial-gradient(
        ellipse 150% 100% at var(--glow-x, 50%) var(--glow-y, -4%),
        color-mix(in srgb, #fff 42%, transparent),
        transparent 58%
      ),
      radial-gradient(
        ellipse 70% 80% at var(--glow-left, 10%) 6%,
        color-mix(in srgb, #fff 22%, transparent),
        transparent 62%
      ),
      radial-gradient(
        ellipse 72% 82% at var(--glow-right, 90%) 10%,
        color-mix(in srgb, #fff 20%, transparent),
        transparent 64%
      ),
      linear-gradient(
        180deg,
        color-mix(in srgb, #fff 16%, transparent),
        color-mix(in srgb, #fff 8%, transparent) 28%,
        transparent 72%
      );
    mask-image: linear-gradient(to bottom, #000 0%, #000 62%, transparent 100%);
    -webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 62%, transparent 100%);
    transform-origin: 50% 0;
    transform: translate3d(var(--glow-shift-x, 0px), var(--glow-shift-y, 0px), 0)
      scale(var(--glow-scale, 1.04));
    animation:
      board-glow-in var(--transition-emphasized) both,
      board-ai-breathe var(--glow-speed, 7s) ease-in-out infinite;
    animation-delay: 0ms, 160ms;
    will-change: opacity, transform;
  }

  :global(html.light-theme) .board-ai-glow {
    background:
      radial-gradient(
        ellipse 150% 100% at var(--glow-x, 50%) var(--glow-y, -4%),
        color-mix(in srgb, #111 16%, transparent),
        transparent 58%
      ),
      radial-gradient(
        ellipse 70% 80% at var(--glow-left, 10%) 6%,
        color-mix(in srgb, #111 10%, transparent),
        transparent 62%
      ),
      radial-gradient(
        ellipse 72% 82% at var(--glow-right, 90%) 10%,
        color-mix(in srgb, #111 10%, transparent),
        transparent 64%
      ),
      linear-gradient(
        180deg,
        color-mix(in srgb, #111 8%, transparent),
        color-mix(in srgb, #111 5%, transparent) 28%,
        transparent 72%
      );
  }
}

@keyframes board-glow-in {
  from {
    opacity: 0;
  }

  to {
    opacity: calc(var(--glow-intensity, 0.82) * 0.86);
  }
}

@keyframes board-ai-breathe {
  0%,
  100% {
    opacity: calc(var(--glow-intensity, 0.82) * 0.78);
  }

  50% {
    opacity: min(1, calc(var(--glow-intensity, 0.82) + 0.12));
  }
}

@media (prefers-reduced-motion: reduce) {
  .board-ai-glow {
    animation: none;
    opacity: var(--glow-intensity, 0.72);
    transform: none;
    will-change: auto;
  }
}
</style>
