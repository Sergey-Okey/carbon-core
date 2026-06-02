<template>
  <div
    ref="rootRef"
    class="app-select"
    :class="{ open: isOpen, disabled }"
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
            :style="{ '--option-color': option.color || 'var(--accent)' }"
            :disabled="option.disabled"
            role="option"
            :aria-selected="option.value === modelValue"
            @mouseenter="highlightedIndex = index"
            @click="selectOption(option)"
          >
            <span
              v-if="option.color"
              class="option-dot"
            />
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
  }>(),
  {
    placeholder: 'Выберите',
    disabled: false,
    id: undefined,
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
  const isInsideModal = Boolean(root.closest('.app-modal'))

  menuPlacement.value = openUp ? 'top' : 'bottom'
  menuStyle.value = {
    left: `${rect.left}px`,
    top: openUp ? `${rect.top - gap}px` : `${rect.bottom + gap}px`,
    width: `${rect.width}px`,
    maxHeight: `${Math.max(140, menuHeight)}px`,
    zIndex: isInsideModal ? '5200' : '4200',
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
  width: 100%;

  &.disabled {
    opacity: 0.6;
    pointer-events: none;
  }
}

.select-trigger {
  @include glass;
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: var(--control-height-md);
  padding: 0 34px 0 12px;
  overflow: hidden;
  border: var(--ui-border);
  border-radius: var(--border-radius-md);
  color: var(--text);
  font: inherit;
  font-size: 0.9rem;
  line-height: 1;
  text-align: left;
  cursor: pointer;
  transition:
    border-color var(--transition-standard),
    background var(--transition-standard);

  &:hover:not(:disabled),
  .app-select.open & {
    border-color: color-mix(in srgb, var(--accent) 45%, var(--ui-border-color));
  }

  &:focus-visible {
    border-color: var(--text);
    outline: none;
    outline: 2px solid color-mix(in srgb, var(--accent) 14%, transparent);
    outline-offset: 2px;
  }

  :deep(svg:not(.select-arrow)) {
    flex-shrink: 0;
    color: var(--dim);
  }
}

.select-value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &.muted {
    color: var(--dim);
  }
}

.option-dot {
  flex: 0 0 auto;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--option-color);
}

.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  color: var(--dim);
  pointer-events: none;
  transform: translateY(-50%);

  .app-select.open & {
    transform: translateY(-50%) rotate(180deg);
  }
}

.select-menu {
  @include glass;
  position: fixed;
  padding: 6px;
  overflow-y: auto;
  border-radius: var(--border-radius-md);

  &.top {
    transform: translateY(-100%);
  }
}

.select-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  min-height: var(--control-height-sm);
  padding: 0 10px;
  border: none;
  border-radius: calc(var(--border-radius-md) - 4px);
  background: transparent;
  color: var(--text);
  font: inherit;
  font-size: 0.88rem;
  text-align: left;
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
  }

  &.highlighted,
  &:hover:not(:disabled) {
    background: var(--glass-surface);
  }

  &.active {
    background: var(--accent);
    color: var(--bg);
    font-weight: 600;
  }

  &.active:hover,
  &.active.highlighted {
    background: var(--accent);
    color: var(--bg);
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
