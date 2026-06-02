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
      <span class="switch-icon switch-icon-off">
        <slot name="off" />
      </span>
      <span class="switch-icon switch-icon-on">
        <slot name="on" />
      </span>
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
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 22px;
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
    justify-self: center;
    margin-left: 0;
    width: 44px;
    height: 44px;
  }
}

.switch-track {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  width: 40px;
  height: 22px;
  padding: 2px;
  border-radius: var(--border-radius-pill);
  border: var(--ui-border);
  background: color-mix(in srgb, var(--surface) 88%, var(--accent) 12%);
  transition:
    background var(--transition-standard),
    border-color var(--transition-standard);

  .checked & {
    background: var(--accent);
    border-color: var(--text);
  }
}

.switch-thumb {
  position: absolute;
  left: 2px;
  top: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--bg);
  will-change: transform;

  .checked & {
    transform: translateX(18px);
  }
}

.switch-icon {
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: currentColor;
  font-size: 10px;
  transition: opacity var(--transition-standard);

  svg,
  img {
    width: 12px;
    height: 12px;
  }

  @include mobile {
    svg,
    img {
      width: 12px;
      height: 12px;
    }
  }
}

.switch-icon-off {
  opacity: 0.85;
  .checked & {
    opacity: 0.35;
  }
}

.switch-icon-on {
  opacity: 0.35;
  .checked & {
    opacity: 0.85;
  }
}
</style>
