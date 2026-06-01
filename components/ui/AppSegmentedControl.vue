<template>
  <div class="app-segmented" role="radiogroup" :aria-label="label">
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
  }>(),
  {
    label: 'Режим',
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<style scoped lang="scss">
.app-segmented {
  @include glass;
  display: grid;
  grid-auto-columns: minmax(0, 1fr);
  grid-auto-flow: column;
  gap: 2px;
  min-width: 0;
  min-height: var(--control-height-md);
  padding: 2px;
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-md);
}

.segment-option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  margin: 0;
  padding: 0 10px;
  overflow: hidden;
  border: 1px solid transparent;
  border-radius: calc(var(--border-radius-md) - 4px);
  background: transparent;
  color: var(--dim);
  cursor: pointer;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition:
    background var(--transition-standard),
    border-color var(--transition-standard),
    color var(--transition-standard);

  &:hover:not(.active) {
    background: color-mix(in srgb, var(--accent) 8%, transparent);
    color: var(--accent);
  }

  &.active {
    border-color: color-mix(in srgb, var(--accent) 22%, var(--glass-border));
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    color: var(--accent);
  }
}
</style>
