<template>
  <button
    type="button"
    class="app-switch"
    :class="{ checked: modelValue }"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="ariaLabel"
    :disabled="disabled"
    @click="toggle"
  >
    <span class="switch-track">
      <span class="switch-thumb" />
    </span>
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: boolean
    ariaLabel?: string
    disabled?: boolean
  }>(),
  {
    ariaLabel: 'Переключатель',
    disabled: false,
  }
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
}>()

function toggle() {
  if (props.disabled) return
  emit('update:modelValue', !props.modelValue)
}
</script>

<style scoped lang="scss">
.app-switch {
  justify-self: end;
  margin-inline-start: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  min-width: 46px;
  height: 44px;
  padding: 0;
  border: none;
  border-radius: var(--border-radius-pill);
  background: transparent;
  cursor: pointer;
  outline: none;
  transition: opacity var(--transition-standard);
  vertical-align: middle;

  &:focus-visible .switch-track {
    outline: 1px solid var(--accent);
    outline-offset: 1px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  @include mobile {
    justify-self: end;
    margin-inline-start: 0;
    width: 46px;
    min-width: 46px;
    height: 44px;
  }
}

.switch-track {
  position: relative;
  display: block;
  width: 46px;
  height: 26px;
  border-radius: var(--border-radius-pill);
  border: var(--ui-border);
  background: color-mix(in srgb, var(--surface) 82%, var(--text) 18%);
  transition:
    background var(--transition-standard),
    border-color var(--transition-standard);

  .checked & {
    background: var(--accent);
    border-color: color-mix(in srgb, var(--accent) 70%, var(--text) 30%);
  }
}

.switch-thumb {
  position: absolute;
  left: 3px;
  top: 50%;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--bg);
  border: var(--ui-border);
  transition:
    transform var(--transition-standard),
    background var(--transition-standard),
    border-color var(--transition-standard);
  transform: translateY(-50%);
  will-change: transform;

  .checked & {
    transform: translate(20px, -50%);
    border-color: color-mix(in srgb, var(--bg) 84%, var(--text) 16%);
  }
}
</style>
