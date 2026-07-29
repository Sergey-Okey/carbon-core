<template>
  <div
    class="skeleton"
    :class="[`variant-${variant}`, `size-${size}`, { round }]"
    :style="styleVars"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'text' | 'rect' | 'circle'
    size?: 'sm' | 'md'
    width?: string
    height?: string
    round?: boolean
  }>(),
  {
    variant: 'text',
    size: 'md',
    width: undefined,
    height: undefined,
    round: false,
  }
)

const styleVars = computed(() => ({
  ...(props.width ? { width: props.width } : {}),
  ...(props.height ? { height: props.height } : {}),
}))
</script>

<style scoped lang="scss">
.skeleton {
  display: block;
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--color-surface-2) 100%, transparent) 0%,
    color-mix(in srgb, var(--color-surface-3) 100%, transparent) 50%,
    color-mix(in srgb, var(--color-surface-2) 100%, transparent) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer var(--duration-slow) var(--ease-standard) infinite;
}

.variant-text {
  width: 100%;
  border-radius: var(--radius-sm);

  &.size-sm {
    height: var(--space-3);
  }

  &.size-md {
    height: var(--space-4);
  }
}

.variant-rect {
  width: 100%;
  border-radius: var(--radius-md);

  &.size-sm {
    height: var(--space-8);
  }

  &.size-md {
    height: var(--space-12);
  }
}

.variant-circle,
.round {
  border-radius: var(--radius-full);
}

.variant-circle {
  width: var(--space-10);
  height: var(--space-10);

  &.size-sm {
    width: var(--space-8);
    height: var(--space-8);
  }
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
