<template>
  <div class="color-picker" role="radiogroup" :aria-label="label">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="color-option"
      :class="{ active: option.value === modelValue }"
      :style="{ '--picker-color': option.color || option.value }"
      role="radio"
      :aria-label="option.label"
      :aria-checked="option.value === modelValue"
      @click="emit('update:modelValue', option.value)"
    >
      <span class="color-dot">
        <Check v-if="option.value === modelValue" :size="12" />
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { Check } from 'lucide-vue-next'

export type ColorPickerOption = {
  label: string
  value: string
  color?: string
}

withDefaults(
  defineProps<{
    modelValue: string
    options?: ColorPickerOption[]
    label?: string
  }>(),
  {
    label: 'Цвет',
    options: () => [
      { label: 'Акцент', value: 'var(--accent)' },
      { label: 'Успех', value: 'var(--success)' },
      { label: 'Внимание', value: 'var(--warning)' },
      { label: 'Ошибка', value: 'var(--error)' },
      { label: 'Золото', value: 'var(--gold)' },
    ],
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<style scoped lang="scss">
.color-picker {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-1);
  width: fit-content;
  max-width: 100%;
  padding: var(--space-1);
  border: var(--ui-border);
  border-radius: var(--radius-full);
  background: var(--color-surface-1);
  box-shadow: var(--shadow-xs);
}

.color-option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--control-icon-size);
  height: var(--control-icon-size);
  padding: 0;
  border: none;
  border-radius: var(--radius-full);
  background: transparent;
  cursor: pointer;
  transition:
    background var(--transition-standard),
    opacity var(--transition-standard);

  .color-dot {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--space-5);
    height: var(--space-5);
    border-radius: var(--radius-full);
    background: var(--picker-color);
    color: var(--color-bg);
    transition:
      outline-color var(--transition-standard),
      outline-offset var(--transition-standard),
      transform var(--transition-standard);
  }

  &:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--color-accent) 40%, transparent);
    outline-offset: 1px;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: color-mix(in srgb, var(--picker-color) 10%, transparent);
    }
  }

  &.active,
  &.active:hover {
    background: color-mix(in srgb, var(--picker-color) 14%, transparent);

    .color-dot {
      outline: 2px solid color-mix(in srgb, var(--picker-color) 64%, var(--color-text-primary) 36%);
      outline-offset: 3px;
    }
  }
}

@media (max-width: 767px) {
  .color-picker {
    width: 100%;
    justify-content: space-between;
    border-radius: var(--radius-lg);
  }

  .color-option {
    width: var(--space-11);
    min-width: var(--space-11);
    height: var(--space-11);
    min-height: var(--space-11);
  }
}
</style>
