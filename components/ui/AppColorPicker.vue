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
      <Check v-if="option.value === modelValue" :size="14" />
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
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.color-option {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: var(--border-radius-sm);
  background:
    linear-gradient(color-mix(in srgb, var(--picker-color) 22%, transparent), color-mix(in srgb, var(--picker-color) 22%, transparent)),
    var(--surface);
  color: var(--accent);
  cursor: pointer;
  transition:
    border-color var(--transition-standard),
    box-shadow var(--transition-standard),
    transform var(--transition-standard);

  &::before {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--picker-color);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--bg) 45%, transparent);
    content: '';
  }

  svg {
    position: absolute;
    color: var(--bg);
    pointer-events: none;
  }

  &:hover,
  &.active {
    border-color: var(--picker-color);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--picker-color) 18%, transparent);
  }

  &.active {
    transform: translateY(-1px);
  }
}
</style>
