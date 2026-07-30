<template>
  <div ref="rootRef" class="app-time-picker" @keydown.esc="close">
    <button
      :id="id"
      type="button"
      class="time-trigger"
      :aria-expanded="isOpen"
      aria-haspopup="dialog"
      @click="toggle"
    >
      <Clock3 :size="15" />
      <span>{{ modelValue }}</span>
      <ChevronDown :size="14" class="trigger-arrow" />
    </button>

    <Teleport to="body">
      <Transition name="time-pop">
        <div
          v-if="isOpen"
          ref="popoverRef"
          class="time-popover"
          :class="popoverPlacement"
          :style="popoverStyle"
          role="dialog"
          :aria-label="label"
        >
          <div class="time-preview">
            <Clock3 :size="16" />
            <span>{{ draftTime }}</span>
          </div>

          <div class="time-columns">
            <div class="time-column">
              <span class="column-label">Часы</span>
              <div ref="hoursRef" class="time-options">
                <button
                  v-for="hour in hours"
                  :key="hour"
                  type="button"
                  class="time-option"
                  :class="{ active: draftHour === hour }"
                  @click="selectHour(hour)"
                >
                  {{ hour }}
                </button>
              </div>
            </div>

            <span class="time-separator">:</span>

            <div class="time-column">
              <span class="column-label">Минуты</span>
              <div ref="minutesRef" class="time-options">
                <button
                  v-for="minute in minutes"
                  :key="minute"
                  type="button"
                  class="time-option"
                  :class="{ active: draftMinute === minute }"
                  @click="selectMinute(minute)"
                >
                  {{ minute }}
                </button>
              </div>
            </div>
          </div>

          <button type="button" class="done-button" @click="close">Готово</button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ChevronDown, Clock3 } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    modelValue: string
    id?: string
    label?: string
  }>(),
  {
    id: undefined,
    label: 'Выбор времени',
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const rootRef = ref<HTMLElement | null>(null)
const popoverRef = ref<HTMLElement | null>(null)
const hoursRef = ref<HTMLElement | null>(null)
const minutesRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const draftHour = ref('00')
const draftMinute = ref('00')
const popoverPlacement = ref<'top' | 'bottom' | 'sheet'>('bottom')
const popoverStyle = ref<Record<string, string>>({})

const hours = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'))
const minutes = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'))
const draftTime = computed(() => `${draftHour.value}:${draftMinute.value}`)

function syncDraft(value = props.modelValue) {
  const [hour = '00', minute = '00'] = value.split(':')
  draftHour.value = hours.includes(hour) ? hour : '00'
  draftMinute.value = minutes.includes(minute) ? minute : '00'
}

function scrollToSelected(container: HTMLElement | null) {
  container?.querySelector<HTMLElement>('.time-option.active')?.scrollIntoView({ block: 'center' })
}

function updatePopoverPosition() {
  const root = rootRef.value
  if (!root || !isOpen.value) return

  if (window.matchMedia('(pointer: coarse), (max-width: 767px)').matches) {
    popoverPlacement.value = 'sheet'
    popoverStyle.value = {
      left: '12px',
      right: '12px',
      bottom: '12px',
      width: 'auto',
      top: 'auto',
      maxHeight: 'min(72dvh, 420px)',
    }
    return
  }

  const rect = root.getBoundingClientRect()
  const gap = 8
  const width = Math.min(292, window.innerWidth - 24)
  const estimatedHeight = 330
  const openUp = window.innerHeight - rect.bottom < estimatedHeight && rect.top > estimatedHeight
  const left = Math.min(Math.max(12, rect.right - width), window.innerWidth - width - 12)

  popoverPlacement.value = openUp ? 'top' : 'bottom'
  popoverStyle.value = {
    left: `${left}px`,
    top: openUp ? `${rect.top - gap}px` : `${rect.bottom + gap}px`,
    width: `${width}px`,
  }
}

function open() {
  syncDraft()
  isOpen.value = true
  nextTick(() => {
    updatePopoverPosition()
    scrollToSelected(hoursRef.value)
    scrollToSelected(minutesRef.value)
  })
}

function close() {
  isOpen.value = false
}

function toggle() {
  if (isOpen.value) close()
  else open()
}

function updateValue() {
  emit('update:modelValue', draftTime.value)
}

function selectHour(hour: string) {
  draftHour.value = hour
  updateValue()
}

function selectMinute(minute: string) {
  draftMinute.value = minute
  updateValue()
}

function handleDocumentPointerDown(event: PointerEvent) {
  const target = event.target as Node
  if (rootRef.value?.contains(target) || popoverRef.value?.contains(target)) return
  close()
}

watch(() => props.modelValue, (value) => {
  if (!isOpen.value) syncDraft(value)
})

onMounted(() => {
  syncDraft()
  document.addEventListener('pointerdown', handleDocumentPointerDown)
  window.addEventListener('resize', updatePopoverPosition)
  window.addEventListener('scroll', updatePopoverPosition, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleDocumentPointerDown)
  window.removeEventListener('resize', updatePopoverPosition)
  window.removeEventListener('scroll', updatePopoverPosition, true)
})
</script>

<style scoped lang="scss">
.app-time-picker {
  position: relative;
  min-width: 112px;
}

.time-trigger {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  min-height: var(--control-height-md);
  padding: 0 var(--space-2);
  border: var(--ui-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-1);
  box-shadow: var(--shadow-xs);
  color: var(--color-text-primary);
  font: inherit;
  font-size: var(--text-sm);
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition:
    border-color var(--transition-standard),
    background var(--transition-standard),
    box-shadow var(--transition-standard);

  &:hover,
  &:focus-visible,
  &[aria-expanded='true'] {
    border-color: color-mix(in srgb, var(--color-accent) 45%, var(--ui-border-color));
  }

  &:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--color-accent) 40%, transparent);
    outline-offset: 1px;
  }

  > svg:first-child {
    color: var(--color-text-secondary);
  }

  span {
    flex: 1;
    text-align: left;
  }
}

.trigger-arrow {
  color: var(--color-text-secondary);
  transition: transform var(--transition-standard);

  [aria-expanded='true'] & {
    transform: rotate(180deg);
  }
}

.time-popover {
  @include glass;
  position: fixed;
  z-index: var(--z-dropdown);
  padding: var(--space-2);
  border: var(--ui-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);

  &.top {
    transform: translateY(-100%);
  }

  &.sheet {
    inset: auto var(--space-3) var(--space-3);
    width: auto;
    max-height: min(72dvh, 420px);
    padding: var(--space-3);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }
}

.time-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: calc(var(--space-11) + var(--space-1));
  margin-bottom: var(--space-2);
  border: var(--ui-border);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-accent) 6%, transparent);
  color: var(--color-text-primary);
  font-size: var(--text-lg);
  font-weight: var(--weight-bold);
  font-variant-numeric: tabular-nums;

  svg {
    color: var(--color-text-secondary);
  }
}

.time-columns {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  gap: var(--space-2);
  align-items: center;
}

.time-column {
  min-width: 0;
}

.column-label {
  display: block;
  margin: 0 0 var(--space-1);
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  text-align: center;
}

.time-options {
  @include nest-shell(var(--radius-md), var(--space-1));
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-1);
  height: 194px;
  overflow-y: auto;
  overscroll-behavior: contain;
  border: var(--ui-border);
  scrollbar-width: thin;
  scroll-snap-type: y proximity;
}

.time-option {
  @include nest-item;
  min-height: var(--space-9);
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font: inherit;
  font-size: var(--text-xs);
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  scroll-snap-align: center;
  transition:
    background var(--transition-standard),
    color var(--transition-standard);

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: color-mix(in srgb, var(--color-accent) 8%, transparent);
      color: var(--color-text-primary);
    }
  }

  &.active {
    background: var(--color-accent);
    color: var(--color-bg);
    font-weight: var(--weight-bold);
  }
}

.time-separator {
  margin-top: var(--space-5);
  color: var(--color-text-muted);
  font-weight: var(--weight-bold);
}

.done-button {
  width: 100%;
  min-height: calc(var(--space-9) + var(--space-1));
  margin-top: var(--space-2);
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-accent);
  color: var(--color-bg);
  font: inherit;
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  cursor: pointer;
}

.time-pop-enter-active,
.time-pop-leave-active {
  transition:
    opacity var(--transition-standard),
    transform var(--transition-standard);
}

.time-pop-enter-from,
.time-pop-leave-to {
  opacity: 0;
  transform: translateY(calc(var(--space-1) * -1));
}

.time-pop.top.time-pop-enter-from,
.time-pop.top.time-pop-leave-to {
  transform: translateY(calc(-100% + var(--space-1)));
}

@media (pointer: coarse), (max-width: 767px) {
  .time-trigger,
  .time-option,
  .done-button {
    min-height: var(--space-11);
  }

  .time-popover.sheet {
    padding: var(--space-3);
    border-radius: var(--radius-lg);
  }

  .time-preview {
    min-height: 50px;
    margin-bottom: var(--space-2);
    font-size: var(--text-md);
  }

  .time-columns {
    gap: var(--space-2);
  }

  .time-options {
    height: min(232px, 34dvh);
  }

  .done-button {
    margin-top: var(--space-2);
  }
}

@media (max-width: 520px) {
  .time-popover.sheet {
    left: var(--space-2) !important;
    right: var(--space-2) !important;
    bottom: var(--space-2) !important;
  }

  .time-columns {
    grid-template-columns: minmax(0, 1fr) 18px minmax(0, 1fr);
    gap: var(--space-2);
  }

  .time-separator {
    margin-top: calc(var(--space-5) + var(--space-1));
    text-align: center;
  }

  .column-label {
    margin-bottom: var(--space-2);
  }

  .time-option {
    font-size: var(--text-sm);
  }
}
</style>
