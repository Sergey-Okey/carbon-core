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
  @include glass;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  width: fit-content;
  max-width: 100%;
  padding: 5px;
  border: var(--ui-border);
  border-radius: var(--border-radius-pill);
}

.color-option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
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
    transition:
      outline-color var(--transition-standard),
      outline-offset var(--transition-standard),
      transform var(--transition-standard);
  }

  &:hover {
    background: color-mix(in srgb, var(--picker-color) 10%, transparent);
  }

  &.active,
  &.active:hover {
    background: color-mix(in srgb, var(--picker-color) 14%, transparent);

    .color-dot {
      outline: 2px solid color-mix(in srgb, var(--picker-color) 64%, var(--text) 36%);
      outline-offset: 3px;
    }
  }
}

@media (max-width: 767px) {
  .color-picker {
    width: 100%;
    justify-content: space-between;
    border-radius: var(--border-radius-lg);
  }

  .color-option {
    width: 44px;
    min-width: 44px;
    height: 44px;
    min-height: 44px;
  }
}
</style>
