<template>
  <button
    :type="type"
    class="app-button"
    :class="[`variant-${variant}`, `size-${size}`, { icon: iconOnly }]"
    :disabled="isDisabled"
    :aria-busy="loading || undefined"
    :data-disabled="isDisabled ? '' : undefined"
    :data-loading="loading ? '' : undefined"
  >
    <AppSpinner v-if="loading" size="md" aria-hidden="true" />
    <span class="label" :class="{ 'is-loading-icon': loading && iconOnly }">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppSpinner from '~/components/ui/primitives/AppSpinner.vue'

const props = withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset'
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
    size?: 'sm' | 'md'
    iconOnly?: boolean
    disabled?: boolean
    loading?: boolean
  }>(),
  {
    type: 'button',
    variant: 'secondary',
    size: 'md',
    iconOnly: false,
    disabled: false,
    loading: false,
  }
)

const isDisabled = computed(() => props.disabled || props.loading)
</script>

<style scoped lang="scss">
.app-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-width: 0;
  border: none;
  border-radius: var(--radius-full);
  background: transparent;
  font: inherit;
  font-weight: var(--weight-medium);
  line-height: var(--leading-none);
  white-space: nowrap;
  cursor: pointer;
  transition:
    background var(--transition-standard),
    border-color var(--transition-standard),
    color var(--transition-standard),
    opacity var(--transition-standard);

  &:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--color-accent) 40%, transparent);
    outline-offset: 2px;
  }

  &:disabled,
  &[data-disabled] {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &[data-loading] {
    cursor: wait;
  }
}

.label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-width: 0;

  &.is-loading-icon {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
}

.size-md {
  min-height: var(--control-height-md);
  padding-inline: var(--space-4);
  font-size: var(--text-sm);
}

.size-sm {
  min-height: var(--control-height-sm);
  padding-inline: var(--space-3);
  font-size: var(--text-xs);
}

.icon {
  position: relative;
  inline-size: var(--control-icon-size);
  block-size: var(--control-icon-size);
  min-height: var(--control-icon-size);
  padding-inline: 0;
  border: none;
  border-radius: var(--radius-full);
}

.variant-primary {
  background: var(--color-accent);
  color: var(--color-bg);

  @media (hover: hover) and (pointer: fine) {
    &:hover:not(:disabled):not([data-disabled]) {
      opacity: 0.88;
    }
  }
}

.variant-secondary:not(.icon) {
  border: var(--ui-border);
  background: transparent;
  color: var(--color-text-secondary);

  @media (hover: hover) and (pointer: fine) {
    &:hover:not(:disabled):not([data-disabled]) {
      background: color-mix(in srgb, var(--color-accent) 8%, transparent);
      color: var(--color-text-primary);
    }
  }
}

.variant-danger {
  border: none;
  background: var(--color-error);
  color: var(--color-bg);

  @media (hover: hover) and (pointer: fine) {
    &:hover:not(:disabled):not([data-disabled]) {
      opacity: 0.88;
    }
  }
}

.variant-ghost {
  border: none;
  color: var(--color-text-secondary);

  @media (hover: hover) and (pointer: fine) {
    &:hover:not(:disabled):not([data-disabled]) {
      background: color-mix(in srgb, var(--color-accent) 8%, transparent);
      color: var(--color-text-primary);
    }
  }
}

@media (pointer: coarse), (max-width: 767px) {
  .size-md,
  .size-sm {
    min-height: var(--space-11);
  }

  .icon {
    inline-size: var(--space-11);
    block-size: var(--space-11);
    min-height: var(--space-11);
  }
}
</style>
