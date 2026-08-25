<template>
  <button
    type="button"
    class="app-switch"
    :class="[`size-${size}`, { checked: modelValue }]"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="ariaLabel"
    :disabled="disabled"
    :data-disabled="disabled ? '' : undefined"
    :data-checked="modelValue ? '' : undefined"
    @click="toggle"
  >
    <span class="switch-track">
      <span class="switch-thumb" />
    </span>
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: boolean
    ariaLabel?: string
    disabled?: boolean
    size?: 'sm' | 'md'
  }>(),
  {
    ariaLabel: 'Переключатель',
    disabled: false,
    size: 'md',
  }
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
}>()

function toggle() {
  if (props.disabled) return
  emit('update:modelValue', !props.modelValue)
}
</script>

<style scoped lang="scss">
.app-switch {
  justify-self: end;
  margin-inline-start: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--space-11);
  min-height: var(--space-11);
  padding: 0;
  border: none;
  border-radius: var(--radius-full);
  background: transparent;
  cursor: pointer;
  outline: none;
  vertical-align: middle;
  transition: opacity var(--transition-standard);

  &:focus-visible .switch-track {
    outline: 2px solid color-mix(in srgb, var(--color-accent) 40%, transparent);
    outline-offset: 2px;
  }

  &:disabled,
  &[data-disabled] {
    cursor: not-allowed;
    opacity: 0.5;
  }

  @include mobile {
    margin-inline-start: 0;
  }
}

.size-md {
  width: var(--space-12);
  min-width: var(--space-12);
}

.size-sm {
  width: var(--space-10);
  min-width: var(--space-10);
}

.switch-track {
  position: relative;
  display: block;
  width: var(--space-12);
  height: var(--space-6);
  border: var(--ui-border);
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-surface-1) 82%, var(--color-text-primary) 18%);
  transition:
    background var(--transition-standard),
    border-color var(--transition-standard);

  .size-sm & {
    width: var(--space-10);
    height: var(--space-6);
  }

  .checked & {
    background: var(--color-accent);
    border-color: color-mix(in srgb, var(--color-accent) 70%, var(--color-text-primary) 30%);
  }
}

.switch-thumb {
  position: absolute;
  left: var(--space-1);
  top: 50%;
  width: var(--space-5);
  height: var(--space-5);
  border: var(--ui-border);
  border-radius: var(--radius-full);
  background: var(--color-bg);
  transform: translateY(-50%);
  transition:
    transform var(--transition-standard),
    background var(--transition-standard),
    border-color var(--transition-standard);
  will-change: transform;

  .size-sm & {
    width: var(--space-4);
    height: var(--space-4);
  }

  .checked & {
    transform: translate(calc(var(--space-12) - var(--space-5) - var(--space-1) * 2), -50%);
    border-color: color-mix(in srgb, var(--color-bg) 84%, var(--color-text-primary) 16%);
  }

  .size-sm.checked & {
    transform: translate(calc(var(--space-10) - var(--space-4) - var(--space-1) * 2), -50%);
  }
}
</style>
