<template>
  <div class="date-picker" ref="rootEl">
    <button type="button" class="date-trigger" @click="toggleOpen">
      <span>{{ displayValue }}</span>
      <Calendar :size="16" />
    </button>

    <Teleport to="body">
      <div v-if="isOpen" ref="popoverEl" class="date-popover" :style="popoverStyle">
        <div class="date-head">
          <button type="button" @click="shiftMonth(-1)" aria-label="Предыдущий месяц">
            <ChevronLeft :size="16" />
          </button>
        <strong>{{ monthLabel }}</strong>
        <button type="button" @click="shiftMonth(1)" aria-label="Следующий месяц">
          <ChevronRight :size="16" />
        </button>
      </div>

      <div class="weekdays">
        <span v-for="day in weekdays" :key="day">{{ day }}</span>
      </div>

      <div class="days-grid">
        <button
          v-for="day in calendarDays"
          :key="day.key"
          type="button"
          class="day-btn"
          :class="{ muted: !day.currentMonth, today: day.isToday, active: day.value === modelValue }"
          @click="selectDate(day.value)"
        >
          {{ day.label }}
        </button>
      </div>

      <div class="date-actions">
        <button type="button" @click="selectDate(todayValue)">Сегодня</button>
        <button type="button" @click="clearDate">Очистить</button>
      </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
  }>(),
  {
    modelValue: '',
    placeholder: 'Выберите дату',
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const rootEl = ref<HTMLElement | null>(null)
const popoverEl = ref<HTMLElement | null>(null)
const popoverStyle = ref<Record<string, string>>({
  top: '0px',
  left: '0px',
  width: '284px',
  maxHeight: '332px',
})
const isOpen = ref(false)
const viewDate = ref(createDateFromValue(props.modelValue) || new Date())
const weekdays = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС']

const todayValue = computed(() => toDateValue(new Date()))
const displayValue = computed(() => {
  if (!props.modelValue) return props.placeholder
  return new Date(`${props.modelValue}T00:00:00`).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
})
const monthLabel = computed(() =>
  viewDate.value.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
)
const calendarDays = computed(() => {
  const year = viewDate.value.getFullYear()
  const month = viewDate.value.getMonth()
  const first = new Date(year, month, 1)
  const start = new Date(first)
  const offset = (first.getDay() + 6) % 7
  start.setDate(first.getDate() - offset)

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    const value = toDateValue(date)
    return {
      key: value,
      value,
      label: date.getDate(),
      currentMonth: date.getMonth() === month,
      isToday: value === todayValue.value,
    }
  })
})

watch(
  () => props.modelValue,
  (value) => {
    const date = createDateFromValue(value)
    if (date) viewDate.value = date
  }
)

function toggleOpen() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => {
      updatePopoverPosition()
      requestAnimationFrame(updatePopoverPosition)
    })
  }
}

function updatePopoverPosition() {
  if (!rootEl.value || !isOpen.value) return

  const viewportPadding = 12
  const isMobilePopover = window.matchMedia('(pointer: coarse), (max-width: 767px)').matches

  if (isMobilePopover) {
    popoverStyle.value = {
      top: 'auto',
      left: `${viewportPadding}px`,
      right: `${viewportPadding}px`,
      bottom: `${Math.max(10, viewportPadding)}px`,
      width: 'auto',
      maxHeight: `${window.innerHeight - viewportPadding * 2}px`,
    }
    return
  }

  const rect = rootEl.value.getBoundingClientRect()
  const gap = 8
  const width = Math.min(284, window.innerWidth - viewportPadding * 2)
  const expectedHeight = popoverEl.value?.offsetHeight || 312
  const availableBelow = window.innerHeight - rect.bottom - viewportPadding
  const availableAbove = rect.top - viewportPadding
  const openUp = availableBelow < expectedHeight && availableAbove > availableBelow
  const maxHeight = Math.max(280, Math.min(expectedHeight, openUp ? availableAbove - gap : availableBelow - gap))
  let left = rect.left

  left = Math.min(left, window.innerWidth - width - viewportPadding)
  left = Math.max(viewportPadding, left)

  popoverStyle.value = {
    top: openUp
      ? `${Math.max(viewportPadding, rect.top - gap - maxHeight)}px`
      : `${Math.min(rect.bottom + gap, window.innerHeight - viewportPadding - maxHeight)}px`,
    left: `${left}px`,
    width: `${width}px`,
    maxHeight: `${maxHeight}px`,
  }
}

function shiftMonth(delta: number) {
  const next = new Date(viewDate.value)
  next.setMonth(next.getMonth() + delta)
  viewDate.value = next
  nextTick(updatePopoverPosition)
}

function selectDate(value: string) {
  emit('update:modelValue', value)
  isOpen.value = false
}

function clearDate() {
  emit('update:modelValue', '')
  isOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node
  if (
    !rootEl.value?.contains(target) &&
    !popoverEl.value?.contains(target)
  ) {
    isOpen.value = false
  }
}

function toDateValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function createDateFromValue(value?: string) {
  if (!value) return null
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  window.addEventListener('resize', updatePopoverPosition)
  window.addEventListener('scroll', updatePopoverPosition, true)
})
onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  window.removeEventListener('resize', updatePopoverPosition)
  window.removeEventListener('scroll', updatePopoverPosition, true)
})
</script>

<style scoped lang="scss">
.date-picker {
  position: relative;
}

.date-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  inline-size: 100%;
  min-height: var(--control-height-md);
  padding-inline: var(--space-4);
  border: var(--ui-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-1);
  box-shadow: var(--shadow-xs);
  color: var(--color-text-primary);
  cursor: pointer;
  font: inherit;
  font-size: var(--text-sm);
  transition:
    background var(--transition-standard),
    border-color var(--transition-standard),
    box-shadow var(--transition-standard);

  &:focus-visible {
    border-color: var(--color-accent);
    outline: 2px solid color-mix(in srgb, var(--color-accent) 40%, transparent);
    outline-offset: 1px;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: color-mix(in srgb, var(--color-accent) 7%, var(--color-surface-1));
    }
  }
}

.date-popover {
  @include glass;
  position: fixed;
  display: grid;
  gap: var(--space-3);
  z-index: var(--z-dropdown);
  inline-size: min(284px, calc(100dvw - var(--space-6) - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px)));
  max-height: min(332px, calc(100dvh - var(--space-6)));
  padding: var(--space-2);
  overflow: hidden;
  border: var(--ui-border);
  border-radius: var(--radius-lg);
  background: var(--glass-surface);
  box-shadow: var(--shadow-md);
  backdrop-filter: var(--glass-strong-filter);
  -webkit-backdrop-filter: var(--glass-strong-filter);
}

.date-head,
.date-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);

  button {
    min-height: var(--space-7);
    padding-inline: var(--space-2);
    border: none;
    border-radius: var(--radius-md);
    background: transparent;
    color: var(--color-text-primary);
    cursor: pointer;
    transition:
      background var(--transition-standard),
      color var(--transition-standard);

    &:focus-visible {
      outline: 2px solid color-mix(in srgb, var(--color-accent) 40%, transparent);
      outline-offset: 1px;
    }

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        background: color-mix(in srgb, var(--color-accent) 8%, transparent);
      }
    }
  }
}

.date-head {
  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 var(--space-8);
    min-width: var(--space-8);
    padding-inline: 0;
  }
}

.date-head strong {
  flex: 1;
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  text-align: center;
  text-transform: capitalize;
}

.weekdays,
.days-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: var(--space-1);
}

.weekdays {
  margin: var(--space-3) 0 var(--space-1);
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  text-align: center;
}

.day-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  border: var(--ui-border);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--color-text-primary);
  cursor: pointer;
  font: inherit;
  font-size: var(--text-xs);

  &.muted {
    color: var(--color-text-muted);
    opacity: 0.5;
  }

  &.today {
    border-color: var(--ui-border-color);
  }

  &.active,
  &:hover {
    border-color: var(--color-accent);
    background: var(--color-accent);
    color: var(--color-bg);
  }

  &.active:hover {
    border-color: var(--color-accent);
    background: var(--color-accent);
    color: var(--color-bg);
  }
}

.date-actions {
  margin-top: 0;
}

@media (pointer: coarse), (max-width: 767px) {
  .date-trigger,
  .date-head button,
  .date-actions button {
    min-height: var(--space-11);
  }

  .date-popover {
    inset-block-start: auto !important;
    inset-block-end: max(var(--space-2), env(safe-area-inset-bottom, 0px));
    inset-inline: max(var(--space-2), env(safe-area-inset-left, 0px)) max(var(--space-2), env(safe-area-inset-right, 0px));
    left: max(var(--space-2), env(safe-area-inset-left, 0px)) !important;
    right: max(var(--space-2), env(safe-area-inset-right, 0px)) !important;
    width: auto !important;
    max-height: calc(100dvh - var(--space-5) - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)) !important;
    padding: var(--space-3);
    border-radius: var(--radius-lg);
  }

  .date-head {
    grid-template-columns: var(--space-11) minmax(0, 1fr) var(--space-11);

    strong {
      font-size: var(--text-md);
    }
  }

  .days-grid {
    gap: 5px;
  }

  .day-btn {
    min-width: 0;
    min-height: var(--space-10);
    aspect-ratio: auto;
  }

  .date-actions {
    gap: var(--space-2);
    margin-top: var(--space-1);

    button {
      flex: 1;
    }
  }
}
</style>
