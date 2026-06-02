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
  width: '304px',
  maxHeight: '360px',
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
    nextTick(updatePopoverPosition)
  }
}

function updatePopoverPosition() {
  if (!rootEl.value || !isOpen.value) return

  const rect = rootEl.value.getBoundingClientRect()
  const gap = 8
  const viewportPadding = 12
  const width = Math.min(304, window.innerWidth - viewportPadding * 2)
  const expectedHeight = popoverEl.value?.offsetHeight || 332
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
  @include glass;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  min-height: 40px;
  padding: 0 14px;
  border: var(--ui-border);
  border-radius: var(--border-radius-md);
  color: var(--accent);
  cursor: pointer;
  font: inherit;
}

.date-popover {
  @include glass;
  position: fixed;
  z-index: 5200;
  width: 304px;
  max-height: min(360px, calc(100dvh - 24px));
  padding: 12px;
  overflow: hidden;
  border: var(--ui-border);
  border-radius: var(--border-radius-lg);
  background: var(--glass-surface);
  backdrop-filter: var(--glass-strong-filter);
  -webkit-backdrop-filter: var(--glass-strong-filter);
}

.date-head,
.date-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  button {
    min-height: 30px;
    padding: 0 9px;
    border: var(--ui-border);
    border-radius: var(--border-radius-md);
    background: var(--glass-surface);
    color: var(--accent);
    cursor: pointer;
  }
}

.date-head strong {
  color: var(--accent);
  font-size: 0.9rem;
  text-transform: capitalize;
}

.weekdays,
.days-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 4px;
}

.weekdays {
  margin: 12px 0 6px;
  color: var(--dim);
  font-size: 0.68rem;
  font-weight: 700;
  text-align: center;
}

.day-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  border: var(--ui-border);
  border-radius: var(--border-radius-pill);
  background: transparent;
  color: var(--accent);
  cursor: pointer;
  font: inherit;
  font-size: 0.78rem;

  &.muted {
    color: var(--dim);
    opacity: 0.5;
  }

  &.today {
    border-color: var(--ui-border-color);
  }

  &.active,
  &:hover {
    border-color: var(--accent);
    background: var(--accent);
    color: var(--bg);
  }

  &.active:hover {
    border-color: var(--accent);
    background: var(--accent);
    color: var(--bg);
  }
}

.date-actions {
  margin-top: 12px;
}
</style>
