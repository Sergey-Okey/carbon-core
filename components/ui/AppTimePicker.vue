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
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
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
  @include glass;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: var(--control-height-md);
  padding: 0 10px;
  border: var(--ui-border);
  border-radius: var(--border-radius-md);
  color: var(--text);
  font: inherit;
  font-size: 0.88rem;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition:
    border-color var(--transition-standard),
    background var(--transition-standard);

  &:hover,
  &:focus-visible,
  &[aria-expanded='true'] {
    border-color: color-mix(in srgb, var(--accent) 45%, var(--ui-border-color));
  }

  &:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--accent) 14%, transparent);
    outline-offset: 2px;
  }

  > svg:first-child {
    color: var(--dim);
  }

  span {
    flex: 1;
    text-align: left;
  }
}

.trigger-arrow {
  color: var(--dim);
  transition: transform var(--transition-standard);

  [aria-expanded='true'] & {
    transform: rotate(180deg);
  }
}

.time-popover {
  @include glass;
  position: fixed;
  z-index: 5200;
  padding: 10px;
  border: var(--ui-border);
  border-radius: var(--border-radius-lg);
  box-shadow: 0 18px 48px color-mix(in srgb, var(--bg) 42%, transparent);

  &.top {
    transform: translateY(-100%);
  }

  &.sheet {
    inset: auto 12px 12px;
    width: auto;
    max-height: min(72dvh, 420px);
    padding: 12px;
    border-radius: calc(var(--border-radius-lg) + 6px);
    overflow: hidden;
  }
}

.time-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 46px;
  margin-bottom: 8px;
  border: var(--ui-border);
  border-radius: var(--border-radius-md);
  background: color-mix(in srgb, var(--accent) 6%, transparent);
  color: var(--text);
  font-size: 1.1rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;

  svg {
    color: var(--dim);
  }
}

.time-columns {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  gap: 8px;
  align-items: center;
}

.time-column {
  min-width: 0;
}

.column-label {
  display: block;
  margin: 0 0 6px;
  color: var(--dim);
  font-size: 0.7rem;
  font-weight: 600;
  text-align: center;
}

.time-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px;
  height: 194px;
  padding: 4px;
  overflow-y: auto;
  overscroll-behavior: contain;
  border: var(--ui-border);
  border-radius: var(--border-radius-md);
  scrollbar-width: thin;
  scroll-snap-type: y proximity;
}

.time-option {
  min-height: 36px;
  border: none;
  border-radius: calc(var(--border-radius-md) - 5px);
  background: transparent;
  color: var(--dim);
  font: inherit;
  font-size: 0.82rem;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  scroll-snap-align: center;
  transition:
    background var(--transition-standard),
    color var(--transition-standard);

  &:hover {
    background: var(--glass-surface);
    color: var(--text);
  }

  &.active {
    background: var(--accent);
    color: var(--bg);
    font-weight: 700;
  }
}

.time-separator {
  margin-top: 20px;
  color: var(--dim);
  font-weight: 700;
}

.done-button {
  width: 100%;
  min-height: 38px;
  margin-top: 8px;
  border: none;
  border-radius: var(--border-radius-md);
  background: var(--accent);
  color: var(--bg);
  font: inherit;
  font-size: 0.84rem;
  font-weight: 700;
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
  transform: translateY(-4px);
}

.time-pop.top.time-pop-enter-from,
.time-pop.top.time-pop-leave-to {
  transform: translateY(calc(-100% + 4px));
}

@media (pointer: coarse), (max-width: 767px) {
  .time-trigger,
  .time-option,
  .done-button {
    min-height: 44px;
  }

  .time-popover.sheet {
    padding: 12px;
    border-radius: calc(var(--border-radius-lg) + 8px) calc(var(--border-radius-lg) + 8px) var(--border-radius-lg) var(--border-radius-lg);
    box-shadow: 0 22px 56px color-mix(in srgb, var(--bg) 30%, transparent);
  }

  .time-preview {
    min-height: 50px;
    margin-bottom: 10px;
    font-size: 1.02rem;
  }

  .time-columns {
    gap: 10px;
  }

  .time-options {
    height: min(232px, 34dvh);
  }

  .done-button {
    margin-top: 10px;
  }
}

@media (max-width: 520px) {
  .time-popover.sheet {
    left: 10px !important;
    right: 10px !important;
    bottom: 10px !important;
  }

  .time-columns {
    grid-template-columns: minmax(0, 1fr) 18px minmax(0, 1fr);
    gap: 8px;
  }

  .time-separator {
    margin-top: 22px;
    text-align: center;
  }

  .column-label {
    margin-bottom: 8px;
  }

  .time-option {
    font-size: 0.86rem;
  }
}
</style>
