<template>
  <component
    :is="multiline ? 'textarea' : 'input'"
    :id="id"
    ref="inputRef"
    class="app-input"
    :class="[`size-${size}`, { invalid }]"
    :type="multiline ? undefined : type"
    :value="modelValue"
    :placeholder="placeholder"
    :required="required"
    :disabled="disabled"
    :aria-invalid="invalid || undefined"
    :data-disabled="disabled ? '' : undefined"
    :data-invalid="invalid ? '' : undefined"
    :min="min"
    :maxlength="maxlength"
    :autocomplete="autocomplete"
    :inputmode="inputmode"
    :rows="multiline ? rows : undefined"
    @input="handleInput"
  />
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: string | number
    id?: string
    type?: string
    placeholder?: string
    required?: boolean
    disabled?: boolean
    invalid?: boolean
    size?: 'sm' | 'md'
    min?: string | number
    maxlength?: string | number
    autocomplete?: string
    inputmode?: string
    multiline?: boolean
    rows?: number
  }>(),
  {
    modelValue: '',
    id: undefined,
    type: 'text',
    placeholder: '',
    required: false,
    disabled: false,
    invalid: false,
    size: 'md',
    min: undefined,
    maxlength: undefined,
    autocomplete: undefined,
    inputmode: undefined,
    multiline: false,
    rows: 3,
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | undefined): void
}>()

const inputRef = ref<HTMLInputElement | HTMLTextAreaElement | null>(null)

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  if (props.type === 'number') {
    emit('update:modelValue', target.value === '' ? undefined : Number(target.value))
    return
  }

  let next = target.value
  if (props.maxlength != null && props.maxlength !== '') {
    const max = Number(props.maxlength)
    if (Number.isFinite(max) && max >= 0 && next.length > max) {
      next = next.slice(0, max)
      target.value = next
    }
  }
  emit('update:modelValue', next)
}

watch(
  () => props.modelValue,
  (value) => {
    const el = inputRef.value
    if (!el) return
    const next = value == null ? '' : String(value)
    if (el.value !== next) el.value = next
  }
)
</script>

<style scoped lang="scss">
.app-input {
  appearance: none;
  -webkit-appearance: none;
  inline-size: 100%;
  padding-inline: var(--space-4);
  border: var(--ui-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-1);
  color: var(--color-text-primary);
  font: inherit;
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: var(--weight-normal);
  line-height: var(--leading-tight);
  box-shadow: var(--shadow-xs);
  transition:
    background var(--transition-standard),
    border-color var(--transition-standard),
    box-shadow var(--transition-standard);

  &::placeholder {
    color: var(--color-text-muted);
    opacity: 1;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover:not(:disabled):not([data-disabled]) {
      border-color: color-mix(in srgb, var(--color-accent) 45%, var(--ui-border-color));
    }
  }

  &:focus {
    outline: none;
  }

  &:focus-visible {
    border-color: var(--color-accent);
    outline: 2px solid color-mix(in srgb, var(--color-accent) 40%, transparent);
    outline-offset: 1px;
    background: var(--color-surface-2);
    box-shadow: var(--shadow-sm);
  }

  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus {
    -webkit-text-fill-color: var(--color-text-primary);
    caret-color: var(--color-text-primary);
    border-color: var(--ui-border-color);
    box-shadow: 0 0 0 1000px var(--color-surface-1) inset;
    transition: background-color 9999s ease-out;
  }

  &:disabled,
  &[data-disabled] {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
  }

  &[data-invalid],
  &.invalid {
    border-color: var(--color-error);

    &:focus-visible {
      outline-color: color-mix(in srgb, var(--color-error) 40%, transparent);
    }
  }
}

.size-md {
  min-height: var(--control-height-md);
}

.size-sm {
  min-height: var(--control-height-sm);
  padding-inline: var(--space-3);
  font-size: var(--text-xs);
}

textarea.app-input {
  min-height: calc(var(--space-11) * 2);
  padding-block: var(--space-3);
  line-height: var(--leading-normal);
  resize: vertical;
}

input[type='search'].app-input {
  appearance: none;

  &::-webkit-search-decoration,
  &::-webkit-search-cancel-button,
  &::-webkit-search-results-button,
  &::-webkit-search-results-decoration {
    appearance: none;
    display: none;
  }
}

@media (pointer: coarse), (max-width: 767px) {
  .app-input {
    min-height: var(--space-11);
    font-size: var(--text-md);
  }

  .size-sm {
    min-height: var(--space-11);
  }
}
</style>
