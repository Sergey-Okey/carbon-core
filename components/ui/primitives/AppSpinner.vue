<template>
  <span
    class="app-spinner"
    :class="[`size-${size}`]"
    role="status"
    :aria-label="label"
  />
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: 'sm' | 'md'
    label?: string
  }>(),
  {
    size: 'md',
    label: 'Загрузка',
  }
)
</script>

<style scoped lang="scss">
.app-spinner {
  display: inline-block;
  flex: 0 0 auto;
  border: 2px solid color-mix(in srgb, currentColor 28%, transparent);
  border-top-color: currentColor;
  border-radius: var(--radius-full);
  animation: app-spinner-spin var(--duration-normal) linear infinite;
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

@keyframes app-spinner-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
