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
  transition: transform 0.12s ease;

  &:focus-visible .switch-track {
    outline: 1px solid var(--accent);
    outline-offset: 1px;
  }

  &:active {
    transform: scale(0.96);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  @include mobile {
    justify-self: center;
    width: 44px;
    height: 24px;
  }
}

.switch-track {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 2px;
  border-radius: var(--border-radius-pill);
  background: color-mix(in srgb, var(--surface) 70%, var(--dim));
  transition: background var(--transition-standard);
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.08);

  .checked & {
    background: var(--accent);
  }
}

.switch-thumb {
  position: absolute;
  left: 2px;
  top: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--surface);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
  transition: transform var(--transition-standard);
  will-change: transform;

  .checked & {
    transform: translateX(18px);
  }

  @include mobile {
    width: 20px;
    height: 20px;
    .checked & {
      transform: translateX(20px);
    }
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
      width: 14px;
      height: 14px;
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