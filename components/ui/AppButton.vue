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
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-md);
  font: inherit;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background var(--transition-standard),
    border-color var(--transition-standard),
    color var(--transition-standard),
    box-shadow var(--transition-standard),
    transform 0.16s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 16%, transparent);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
  }
}

.size-md {
  min-height: var(--control-height-md);
  padding: 0 16px;
  font-size: 0.92rem;
}

.size-sm {
  min-height: var(--control-height-sm);
  padding: 0 12px;
  font-size: 0.85rem;
}

.icon {
  width: var(--control-icon-size);
  height: var(--control-icon-size);
  min-height: var(--control-icon-size);
  padding: 0;
  border-radius: var(--border-radius-pill);
}

.variant-primary {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--bg);
}

.variant-secondary {
  @include glass;
  border-color: var(--glass-border);
  color: var(--dim);

  &:hover:not(:disabled) {
    color: var(--accent);
  }
}

.variant-danger {
  @include glass;
  border-color: var(--error);
  color: var(--error);

  &:hover:not(:disabled) {
    background: var(--error);
    color: var(--bg);
  }
}

.variant-ghost {
  @include glass;
  color: var(--dim);

  &:hover:not(:disabled) {
    color: var(--accent);
  }
}
</style>
