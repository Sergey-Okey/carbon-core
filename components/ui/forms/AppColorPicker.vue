<template>
  <div class="color-picker" role="radiogroup" :aria-label="label">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="swatch"
      :class="{
        active: option.value === modelValue,
        light: isLightColor(option.color || option.value),
      }"
      :style="{ '--swatch': option.color || option.value }"
      role="radio"
      :aria-label="option.label"
      :aria-checked="option.value === modelValue"
      @click="emit('update:modelValue', option.value)"
    >
      <Check v-if="option.value === modelValue" class="swatch-check" :size="14" :stroke-width="2.6" />
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

function isLightColor(color: string) {
  const match = color.trim().match(/^#([0-9a-f]{6})$/i)
  if (!match) return false
  const value = match[1]
  const r = parseInt(value.slice(0, 2), 16) / 255
  const g = parseInt(value.slice(2, 4), 16) / 255
  const b = parseInt(value.slice(4, 6), 16) / 255
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.62
}
</script>

<style scoped lang="scss">
.color-picker {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  width: fit-content;
  max-width: 100%;
}

.swatch {
  position: relative;
  display: inline-grid;
  place-items: center;
  width: 36px;
  height: 36px;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 12px;
  background: var(--swatch);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-text-primary) 10%, transparent);
  color: #fff;
  cursor: pointer;
  transition:
    transform 180ms cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow var(--transition-standard),
    filter var(--transition-standard);

  &:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--color-accent) 45%, transparent);
    outline-offset: 3px;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-1px) scale(1.04);
      filter: saturate(1.08);
    }
  }

  &.active {
    transform: scale(1.06);
    box-shadow:
      0 0 0 2px var(--color-surface-1),
      0 0 0 4px var(--swatch);
  }

  &.light {
    color: #1a1a1a;
  }
}

.swatch-check {
  filter: none;
}

.swatch.light .swatch-check {
  filter: none;
}

@include mobile {
  .color-picker {
    width: 100%;
    gap: var(--space-2);
  }

  .swatch {
    width: var(--space-10);
    height: var(--space-10);
    border-radius: 14px;
  }
}
</style>
