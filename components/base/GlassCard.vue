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
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

  .light-theme & {
    background: rgba(255, 255, 255, 0.7);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  &.no-padding {
    padding: 0;
  }
}
</style>
