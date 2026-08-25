<template>
  <span
    class="app-spinner"
    :class="[`size-${size}`, `shape-${shape}`]"
    role="status"
    :aria-label="label"
  />
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: 'sm' | 'md'
    shape?: 'circle' | 'cube'
    label?: string
  }>(),
  {
    size: 'md',
    shape: 'circle',
    label: 'Загрузка',
  }
)
</script>

<style scoped lang="scss">
.app-spinner {
  display: inline-block;
  flex: 0 0 auto;
}

.shape-circle {
  border: 2px solid color-mix(in srgb, currentColor 28%, transparent);
  border-top-color: currentColor;
  border-radius: var(--radius-full);
  animation: app-spinner-spin var(--duration-normal) linear infinite;
}

.shape-cube {
  border-radius: 2px;
  background: currentColor;
  animation: app-cube 0.9s ease-in-out infinite;
}

.size-sm {
  inline-size: var(--space-3);
  block-size: var(--space-3);
}

.size-md {
  inline-size: 1em;
  block-size: 1em;
  min-inline-size: var(--space-4);
  min-block-size: var(--space-4);
}

.shape-cube.size-md {
  inline-size: var(--space-3);
  block-size: var(--space-3);
  min-inline-size: var(--space-3);
  min-block-size: var(--space-3);
}

@keyframes app-spinner-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes app-cube {
  0%,
  100% {
    transform: rotate(0deg) scale(0.82);
    opacity: 0.45;
  }
  50% {
    transform: rotate(90deg) scale(1);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-spinner {
    animation: none;
    opacity: 0.7;
  }
}
</style>
