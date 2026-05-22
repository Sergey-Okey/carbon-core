<template>
  <div class="color-picker" role="radiogroup" :aria-label="label">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="color-option"
      :class="{ active: option.value === modelValue }"
      :style="{ '--picker-color': option.value }"
      :title="option.label"
      role="radio"
      :aria-checked="option.value === modelValue"
      @click="emit('update:modelValue', option.value)"
    >
      <span class="color-swatch" />
      <Check v-if="option.value === modelValue" :size="13" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { Check } from 'lucide-vue-next'

export type ColorPickerOption = {
  label: string
  value: string
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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(42px, 1fr));
  gap: 10px;
}

.color-option {
  @include glass;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 42px;
  height: 38px;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: var(--border-radius-md);
  background: color-mix(in srgb, var(--surface) 34%, transparent);
  color: var(--accent);
  cursor: pointer;
  transition:
    background var(--transition-standard),
    border-color var(--transition-standard),
    box-shadow var(--transition-standard),
    transform var(--transition-standard);

  .color-swatch {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--picker-color);
    box-shadow:
      inset 0 0 0 1px color-mix(in srgb, var(--bg) 38%, transparent),
      0 0 0 4px color-mix(in srgb, var(--picker-color) 12%, transparent);
  }

  svg {
    position: absolute;
    right: 6px;
    top: 6px;
    color: var(--picker-color);
    pointer-events: none;
  }

  &:hover {
    border-color: color-mix(in srgb, var(--picker-color) 54%, var(--border));
    background: color-mix(in srgb, var(--surface) 46%, transparent);
  }

  &.active {
    border-color: var(--picker-color);
    background: color-mix(in srgb, var(--picker-color) 8%, transparent);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--picker-color) 16%, transparent);
    transform: translateY(-1px);
  }
}
</style>
