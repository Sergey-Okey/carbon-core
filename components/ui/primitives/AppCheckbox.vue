<template>
  <label
    class="app-checkbox"
    :class="[`size-${size}`]"
    :data-disabled="disabled ? '' : undefined"
  >
    <input
      type="checkbox"
      class="app-checkbox__input"
      :checked="modelValue"
      :disabled="disabled"
      :aria-invalid="invalid || undefined"
      :data-invalid="invalid ? '' : undefined"
      @change="onChange"
    />
    <span class="app-checkbox__box" aria-hidden="true" />
    <span v-if="label || $slots.default" class="app-checkbox__label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    label?: string
    disabled?: boolean
    invalid?: boolean
    size?: 'sm' | 'md'
  }>(),
  {
    modelValue: false,
    label: undefined,
    disabled: false,
    invalid: false,
    size: 'md',
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

function onChange(event: Event) {
  if (props.disabled) return
  emit('update:modelValue', (event.target as HTMLInputElement).checked)
}
</script>

<style scoped lang="scss">
.app-checkbox {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: var(--space-11);
  cursor: pointer;
  color: var(--color-text-primary);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  line-height: var(--leading-tight);

  &[data-disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.app-checkbox__input {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.app-checkbox__box {
  display: inline-grid;
  place-content: center;
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  border: var(--ui-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface-1);
  transition:
    background var(--transition-standard),
    border-color var(--transition-standard),
    box-shadow var(--transition-standard);

  &::before {
    width: 8px;
    height: 4px;
    border: solid var(--color-bg);
    border-width: 0 0 2px 2px;
    content: '';
    opacity: 0;
    transform: translateY(-1px) rotate(-45deg) scale(0.6);
    transition:
      opacity var(--transition-standard),
      transform var(--transition-standard);
  }
}

.size-sm {
  min-height: var(--space-8);
  font-size: var(--text-xs);

  .app-checkbox__box {
    width: 16px;
    height: 16px;
    flex-basis: 16px;
  }
}

.app-checkbox__input:checked + .app-checkbox__box {
  border-color: var(--color-accent);
  background: var(--color-accent);

  &::before {
    opacity: 1;
    transform: translateY(-1px) rotate(-45deg) scale(1);
  }
}

.app-checkbox__input:focus-visible + .app-checkbox__box {
  outline: 2px solid color-mix(in srgb, var(--color-accent) 40%, transparent);
  outline-offset: 2px;
}

.app-checkbox__input[data-invalid] + .app-checkbox__box,
.app-checkbox__input[aria-invalid='true'] + .app-checkbox__box {
  border-color: var(--color-error);
}

.app-checkbox__label {
  min-width: 0;
}
</style>
