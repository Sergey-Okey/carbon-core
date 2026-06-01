<template>
  <component
    :is="multiline ? 'textarea' : 'input'"
    :id="id"
    class="app-input"
    :class="{ invalid }"
    :type="multiline ? undefined : type"
    :value="modelValue"
    :placeholder="placeholder"
    :required="required"
    :disabled="disabled"
    :min="min"
    :maxlength="maxlength"
    :autocomplete="autocomplete"
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
    min?: string | number
    maxlength?: string | number
    autocomplete?: string
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
    min: undefined,
    maxlength: undefined,
    autocomplete: undefined,
    multiline: false,
    rows: 3,
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | undefined): void
}>()

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  if (props.type === 'number') {
    emit('update:modelValue', target.value === '' ? undefined : Number(target.value))
    return
  }
  emit('update:modelValue', target.value)
}
</script>

<style scoped lang="scss">
.app-input {
  @include glass;
  width: 100%;
  min-height: var(--control-height-md);
  padding: 0 14px;
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-md);
  color: var(--accent);
  font: inherit;
  font-size: 0.92rem;
  line-height: 1.2;
  transition:
    background var(--transition-standard),
    border-color var(--transition-standard),
    box-shadow var(--transition-standard);

  &::placeholder {
    color: var(--dim);
    opacity: 0.68;
  }

  &:hover:not(:disabled) {
    border-color: color-mix(in srgb, var(--accent) 45%, var(--border));
  }

  &:focus {
    border-color: var(--accent);
    outline: none;
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 14%, transparent);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.invalid {
    border-color: var(--error);
  }
}

textarea.app-input {
  min-height: 88px;
  padding-top: 11px;
  padding-bottom: 11px;
  line-height: 1.45;
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

@media (max-width: 640px) {
  .app-input {
    min-height: var(--control-height-md);
    font-size: 16px;
  }
}
</style>
