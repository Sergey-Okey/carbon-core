<template>
  <button
    :type="type"
    class="app-button"
    :class="[`variant-${variant}`, `size-${size}`, { icon: iconOnly }]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset'
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
    size?: 'sm' | 'md'
    iconOnly?: boolean
    disabled?: boolean
  }>(),
  {
    type: 'button',
    variant: 'secondary',
    size: 'md',
    iconOnly: false,
    disabled: false,
  }
)
</script>

<style scoped lang="scss">
.app-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 0;
  border: none;
  border-radius: var(--border-radius-pill);
  background: transparent;
  font: inherit;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background var(--transition-standard),
    border-color var(--transition-standard),
    color var(--transition-standard);

  &:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--accent) 16%, transparent);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
}

.size-md {
  min-height: var(--control-height-md);
  padding-inline: 16px;
  font-size: 0.92rem;
}

.size-sm {
  min-height: var(--control-height-sm);
  padding-inline: 12px;
  font-size: 0.85rem;
}

.icon {
  inline-size: var(--control-icon-size);
  block-size: var(--control-icon-size);
  min-height: var(--control-icon-size);
  padding-inline: 0;
  border: none;
  border-radius: var(--border-radius-pill);
}

.variant-primary {
  background: var(--accent);
  color: var(--bg);

  &:hover:not(:disabled) {
    background: var(--accent);
    color: var(--bg);
  }
}

.variant-secondary:not(.icon) {
  border: var(--ui-border);
  background: transparent;
  color: var(--dim);

  &:hover:not(:disabled) {
    background: color-mix(in srgb, var(--accent) 8%, transparent);
    border-color: var(--ui-border-color);
    color: var(--text);
  }
}

.variant-danger {
  border: none;
  background: var(--error);
  color: var(--bg);

  &:hover:not(:disabled) {
    background: var(--error);
    color: var(--bg);
  }
}

.variant-ghost {
  border: none;
  color: var(--dim);

  &:hover:not(:disabled) {
    background: color-mix(in srgb, var(--accent) 8%, transparent);
    color: var(--text);
  }
}

@media (pointer: coarse), (max-width: 767px) {
  .size-md,
  .size-sm {
    min-height: 44px;
  }

  .icon {
    inline-size: 44px;
    block-size: 44px;
    min-height: 44px;
  }
}
</style>
