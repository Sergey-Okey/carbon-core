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
  gap: 12px;
}

.color-option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
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
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--picker-color);
    color: var(--bg);
    box-shadow: none;
    transition:
      box-shadow var(--transition-standard),
      transform var(--transition-standard);
  }

  &:hover {
    background: var(--glass-surface);

    .color-dot {
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--picker-color) 28%, transparent);
    }
  }

  &.active {
    background: var(--accent);

    .color-dot {
      box-shadow: 0 0 0 2px var(--bg);
    }
  }

  &.active:hover {
    background: var(--accent);
  }
}
</style>
