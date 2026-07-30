<template>
  <div
    class="app-segmented"
    :class="[`size-${size}`]"
    role="radiogroup"
    :aria-label="label"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="segment-option"
      :class="{ active: modelValue === option.value }"
      role="radio"
      :aria-checked="modelValue === option.value"
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
export type SegmentOption = {
  label: string
  value: string
}

withDefaults(
  defineProps<{
    modelValue: string
    options: SegmentOption[]
    label?: string
    size?: 'sm' | 'md'
  }>(),
  {
    label: 'Режим',
    size: 'md',
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<style scoped lang="scss">
.app-segmented {
  @include nest-shell(var(--radius-md), var(--space-1));
  display: grid;
  grid-auto-columns: minmax(0, 1fr);
  grid-auto-flow: column;
  gap: var(--space-1);
  min-inline-size: 0;
  min-height: var(--control-height-md);
  border: var(--ui-border);
  background: var(--color-surface-1);
  box-shadow: var(--shadow-xs);

  &.size-sm {
    --nest-pad: 2px;
    min-height: var(--control-height-sm);
    padding: var(--nest-pad);
  }
}

.segment-option {
  @include nest-item;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-inline-size: 0;
  margin: 0;
  padding-inline: var(--space-2);
  overflow: hidden;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  font: inherit;
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  text-overflow: ellipsis;
  white-space: nowrap;
  transition:
    background var(--transition-standard),
    color var(--transition-standard);

  &:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--color-accent) 40%, transparent);
    outline-offset: 1px;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover:not(.active) {
      background: color-mix(in srgb, var(--color-accent) 8%, transparent);
      color: var(--color-text-primary);
    }
  }

  &.active {
    background: var(--color-accent);
    color: var(--color-bg);
  }
}

@media (pointer: coarse), (max-width: 767px) {
  .app-segmented,
  .segment-option {
    min-height: var(--space-11);
  }

  .segment-option {
    padding-inline: var(--space-1);
    font-size: var(--text-xs);
  }
}

@media (max-width: 420px) {
  .segment-option {
    padding-inline: var(--space-1);
    font-size: 0.7rem;
  }
}
</style>
