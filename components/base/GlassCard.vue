<template>
  <div class="glass-card" :class="{ 'no-padding': noPadding }">
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{ noPadding?: boolean }>()
</script>

<style scoped lang="scss">
.glass-card {
  @include glass;
  border-radius: var(--border-radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-lg);

  .light-theme & {
    background: color-mix(in srgb, var(--surface) 70%, transparent);
    box-shadow: var(--shadow-lg);
  }

  &.no-padding {
    padding: 0;
  }
}
</style>
