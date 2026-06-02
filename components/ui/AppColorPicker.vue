<template>
  <div class="color-picker" role="radiogroup" :aria-label="label">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="color-option"
      :class="{ active: option.value === modelValue }"
      :style="{ '--picker-color': option.value }"
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  transition:
    background var(--transition-standard),
    opacity var(--transition-standard);

  .color-dot {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--picker-color);
    color: var(--bg);
    transition: box-shadow var(--transition-standard);
  }

  &:hover {
    background: color-mix(in srgb, var(--picker-color) 12%, transparent);
  }

  &.active,
  &.active:hover {
    background: color-mix(in srgb, var(--picker-color) 18%, transparent);

    .color-dot {
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--picker-color) 22%, transparent);
    }
  }
}

@media (max-width: 767px) {
  .color-option {
    min-width: 44px;
    min-height: 44px;
  }
}
</style>
