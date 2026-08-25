<template>
  <span
    class="app-badge"
    :class="[`variant-${variant}`, `size-${size}`]"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'neutral' | 'accent' | 'success' | 'warning' | 'error' | 'eyebrow'
    size?: 'sm' | 'md'
  }>(),
  {
    variant: 'neutral',
    size: 'md',
  }
)
</script>

<style scoped lang="scss">
.app-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  min-height: var(--space-5);
  padding-inline: var(--space-2);
  border: var(--ui-border);
  border-radius: var(--radius-full);
  font-family: var(--font-sans);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-none);
  white-space: nowrap;
}

.size-sm {
  min-height: var(--space-4);
  padding-inline: var(--space-1);
}

.variant-neutral {
  background: var(--color-surface-2);
  color: var(--color-text-secondary);
}

.variant-accent {
  background: var(--color-accent);
  color: var(--color-bg);
  border-color: transparent;
}

.variant-success {
  background: color-mix(in srgb, var(--color-success) 16%, transparent);
  color: var(--color-success);
}

.variant-warning {
  background: color-mix(in srgb, var(--color-warning) 16%, transparent);
  color: var(--color-warning);
}

.variant-error {
  background: color-mix(in srgb, var(--color-error) 16%, transparent);
  color: var(--color-error);
}

.variant-eyebrow {
  min-height: 0;
  padding-inline: 0;
  border: none;
  border-radius: 0;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: var(--text-2xs);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
</style>
