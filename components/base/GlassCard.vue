<template>
  <div
    class="glass-card"
    :class="[`variant-${variant}`, { 'no-padding': noPadding }]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    noPadding?: boolean
    variant?: 'glass' | 'frosted' | 'surface'
  }>(),
  {
    noPadding: false,
    variant: 'glass',
  }
)
</script>

<style scoped lang="scss">
.glass-card {
  border-radius: var(--radius-lg);
  padding: var(--panel-padding);
  color: var(--color-text-primary);

  &.no-padding {
    padding: 0;
  }
}

.variant-glass {
  @include glass;
  border: var(--ui-border);
}

.variant-frosted {
  @include frosted;
  background-color: var(--frosted-surface);
  overflow: visible;
}

.variant-surface {
  border: var(--ui-border);
  background: var(--color-surface-1);
  box-shadow: none;
}
</style>
