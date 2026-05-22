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
  @include glass;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 0;
  border: 1px solid transparent;
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
  min-height: 40px;
  padding: 0 18px;
  font-size: 0.95rem;
}

.size-sm {
  min-height: 34px;
  padding: 0 13px;
  font-size: 0.85rem;
}

.icon {
  width: 34px;
  height: 34px;
  min-height: 34px;
  padding: 0;
  border-radius: 50%;
}

.variant-primary {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--bg);
}

.variant-secondary {
  background: color-mix(in srgb, var(--surface) 42%, transparent);
  border-color: var(--border);
  color: var(--dim);

  &:hover:not(:disabled) {
    background: color-mix(in srgb, var(--surface) 64%, transparent);
    color: var(--accent);
  }
}

.variant-danger {
  background: color-mix(in srgb, var(--surface) 34%, transparent);
  border-color: var(--error);
  color: var(--error);

  &:hover:not(:disabled) {
    background: var(--error);
    color: var(--bg);
  }
}

.variant-ghost {
  background: transparent;
  color: var(--dim);

  &:hover:not(:disabled) {
    background: color-mix(in srgb, var(--surface) 60%, transparent);
    color: var(--accent);
  }
}
</style>
