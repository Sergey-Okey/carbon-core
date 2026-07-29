<template>
  <div
    ref="rootRef"
    class="app-select"
    :class="[`size-${size}`, { open: isOpen }]"
    :data-disabled="disabled ? '' : undefined"
    @keydown.down.prevent="moveHighlight(1)"
    @keydown.up.prevent="moveHighlight(-1)"
    @keydown.enter.prevent="selectHighlighted"
    @keydown.esc.prevent="close"
  >
    <button
      :id="id"
      type="button"
      class="select-trigger"
      :disabled="disabled"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      @click="toggle"
    >
      <slot name="icon" />
      <span
        v-if="selectedOption?.color"
        class="option-dot"
        :style="{ '--option-color': selectedOption.color }"
      />
      <span class="select-value" :class="{ muted: !selectedOption }">
        {{ selectedOption?.label || placeholder }}
      </span>
      <ChevronDown :size="16" class="select-arrow" />
    </button>

    <Teleport to="body">
      <Transition name="select-pop">
        <div
          v-if="isOpen"
          ref="menuRef"
          class="select-menu"
          :class="menuPlacement"
          :style="menuStyle"
          role="listbox"
        >
          <button
            v-for="(option, index) in options"
            :key="String(option.value)"
            type="button"
            class="select-option"
            :class="{
              active: option.value === modelValue,
              highlighted: index === highlightedIndex,
            }"
            :style="{ '--option-color': option.color || 'var(--color-accent)' }"
            :disabled="option.disabled"
            role="option"
            :aria-selected="option.value === modelValue"
            @mouseenter="highlightedIndex = index"
            @click="selectOption(option)"
          >
            <span v-if="option.color" class="option-dot" />
            <span class="option-label">{{ option.label }}</span>
            <Check v-if="option.value === modelValue" :size="15" />
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { Check, ChevronDown } from 'lucide-vue-next'
import type { AppSelectOption } from '~/types/ui.types'

const props = withDefaults(
  defineProps<{
    modelValue: string
    options: AppSelectOption[]
    placeholder?: string
    disabled?: boolean
    id?: string
    size?: 'sm' | 'md'
  }>(),
  {
    placeholder: 'Выберите',
    disabled: false,
    id: undefined,
    size: 'md',
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const rootRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const highlightedIndex = ref(-1)
const menuPlacement = ref<'top' | 'bottom'>('bottom')
const menuStyle = ref<Record<string, string>>({})

const selectedOption = computed(() =>
  props.options.find((option) => option.value === props.modelValue)
)

function open() {
  if (props.disabled) return
  const selectedIndex = props.options.findIndex((option) => option.value === props.modelValue)
  highlightedIndex.value = selectedIndex === -1 ? firstEnabledIndex() : selectedIndex
  isOpen.value = true
  nextTick(updateMenuPosition)
}

function close() {
  isOpen.value = false
}

function toggle() {
  if (isOpen.value) close()
  else open()
}

function updateMenuPosition() {
  const root = rootRef.value
  if (!root || !isOpen.value) return

  const rect = root.getBoundingClientRect()
  const gap = 8
  const maxHeight = 240
  const availableBelow = window.innerHeight - rect.bottom - gap
  const availableAbove = rect.top - gap
  const openUp = availableBelow < 180 && availableAbove > availableBelow
  const menuHeight = Math.min(maxHeight, openUp ? availableAbove : availableBelow)

  menuPlacement.value = openUp ? 'top' : 'bottom'
  menuStyle.value = {
    left: `${rect.left}px`,
    top: openUp ? `${rect.top - gap}px` : `${rect.bottom + gap}px`,
    width: `${rect.width}px`,
    maxHeight: `${Math.max(140, menuHeight)}px`,
    zIndex: 'var(--z-dropdown)',
  }
}

function firstEnabledIndex() {
  return props.options.findIndex((option) => !option.disabled)
}

function moveHighlight(direction: 1 | -1) {
  if (!isOpen.value) {
    open()
    return
  }

  if (!props.options.length) return

  let nextIndex = highlightedIndex.value
  for (let index = 0; index < props.options.length; index += 1) {
    nextIndex = (nextIndex + direction + props.options.length) % props.options.length
    if (!props.options[nextIndex].disabled) {
      highlightedIndex.value = nextIndex
      return
    }
  }
}

function selectHighlighted() {
  if (!isOpen.value) {
    open()
    return
  }

  const option = props.options[highlightedIndex.value]
  if (option) selectOption(option)
}

function selectOption(option: AppSelectOption) {
  if (option.disabled) return
  emit('update:modelValue', option.value)
  close()
}

function handleDocumentPointerDown(event: PointerEvent) {
  const target = event.target as Node
  if (rootRef.value?.contains(target) || menuRef.value?.contains(target)) return
  close()
}

onMounted(() => {
  document.addEventListener('pointerdown', handleDocumentPointerDown)
  window.addEventListener('resize', updateMenuPosition)
  window.addEventListener('scroll', updateMenuPosition, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleDocumentPointerDown)
  window.removeEventListener('resize', updateMenuPosition)
  window.removeEventListener('scroll', updateMenuPosition, true)
})
</script>

<style scoped lang="scss">
.app-select {
  position: relative;
  inline-size: 100%;

  &[data-disabled] {
    opacity: 0.6;
    pointer-events: none;
  }
}

.select-trigger {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  inline-size: 100%;
  min-block-size: var(--control-height-md);
  padding-inline: var(--space-3) calc(var(--space-8) + var(--space-1));
  overflow: hidden;
  border: var(--ui-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-1);
  box-shadow: var(--shadow-xs);
  color: var(--color-text-primary);
  font: inherit;
  font-size: var(--text-sm);
  line-height: var(--leading-none);
  text-align: start;
  cursor: pointer;
  transition:
    border-color var(--transition-standard),
    background var(--transition-standard),
    box-shadow var(--transition-standard);

  .size-sm & {
    min-block-size: var(--control-height-sm);
    padding-inline: var(--space-2) var(--space-8);
    font-size: var(--text-xs);
  }

  .app-select.open & {
    border-color: color-mix(in srgb, var(--color-accent) 45%, var(--ui-border-color));
    box-shadow: var(--shadow-sm);
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover:not(:disabled) {
      border-color: color-mix(in srgb, var(--color-accent) 45%, var(--ui-border-color));
    }
  }

  &:focus-visible {
    border-color: var(--color-accent);
    outline: 2px solid color-mix(in srgb, var(--color-accent) 40%, transparent);
    outline-offset: 1px;
  }

  :deep(svg:not(.select-arrow)) {
    flex-shrink: 0;
    color: var(--color-text-secondary);
  }
}

.select-value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &.muted {
    color: var(--color-text-muted);
  }
}

.option-dot {
  flex: 0 0 auto;
  width: 9px;
  height: 9px;
  border-radius: var(--radius-full);
  background: var(--option-color);
}

.select-arrow {
  position: absolute;
  inset-inline-end: var(--space-3);
  inset-block-start: 50%;
  color: var(--color-text-secondary);
  pointer-events: none;
  transform: translateY(-50%);
  transition: transform var(--transition-standard);

  .app-select.open & {
    transform: translateY(-50%) rotate(180deg);
  }
}

.select-menu {
  @include glass;
  position: fixed;
  padding: var(--space-1);
  overflow-y: auto;
  border: var(--ui-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);

  &.top {
    transform: translateY(-100%);
  }
}

.select-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  inline-size: 100%;
  min-height: var(--control-height-sm);
  padding-inline: var(--space-2);
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-primary);
  font: inherit;
  font-size: var(--text-sm);
  text-align: start;
  cursor: pointer;
  transition:
    background var(--transition-standard),
    color var(--transition-standard);

  .option-label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &.highlighted {
    background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  }

  &.active {
    background: var(--color-accent);
    color: var(--color-bg);
    font-weight: var(--weight-semibold);
  }

  &.active.highlighted {
    background: var(--color-accent);
    color: var(--color-bg);
  }
}

@media (hover: hover) and (pointer: fine) {
  .select-option:hover:not(:disabled):not(.active) {
    background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  }

  .select-option.active:hover {
    background: var(--color-accent);
    color: var(--color-bg);
  }
}

@media (pointer: coarse), (max-width: 767px) {
  .select-trigger,
  .select-option {
    min-height: var(--space-11);
  }
}

.select-pop-enter-active,
.select-pop-leave-active {
  transition: opacity var(--transition-standard);
}

.select-pop-enter-from,
.select-pop-leave-to {
  opacity: 0;
}
</style>
