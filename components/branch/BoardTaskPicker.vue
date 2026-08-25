<template>
  <div ref="rootRef" class="task-picker" :class="{ open: isOpen }">
    <button
      type="button"
      class="task-picker__trigger"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      @click="toggle"
    >
      <span class="task-picker__value">{{ triggerLabel }}</span>
      <ChevronDown :size="16" class="task-picker__arrow" />
    </button>

    <Teleport v-if="isOpen" to="body">
      <div
        ref="menuRef"
        class="task-picker__menu"
        :class="menuPlacement"
        :style="menuStyle"
        role="listbox"
        aria-multiselectable="true"
        :aria-label="label"
      >
          <div class="task-picker__search">
            <AppInput
              v-model="query"
              size="sm"
              type="search"
              placeholder="Найти задачу"
              aria-label="Найти задачу"
              @keydown.stop
            />
          </div>

          <div class="task-picker__list">
            <p v-if="!visibleTasks.length" class="task-picker__empty">
              {{ query.trim() ? 'Ничего не найдено' : 'Нет доступных задач' }}
            </p>
            <button
              v-for="task in visibleTasks"
              :id="optionId(task.id)"
              :key="task.id"
              type="button"
              class="task-picker__option"
              :class="{ selected: modelValue.includes(task.id), elsewhere: task.elsewhere }"
              role="option"
              :aria-selected="modelValue.includes(task.id)"
              :disabled="task.elsewhere"
              @click="toggleTask(task.id)"
            >
              <span class="task-picker__check" aria-hidden="true" />
              <span class="task-picker__copy">
                <span class="task-picker__title">{{ task.title }}</span>
                <span v-if="task.elsewhere" class="task-picker__hint">Уже привязана</span>
              </span>
              <span
                v-if="showType"
                class="task-picker__marker"
                :aria-label="typeMeta(task.type).title"
              >
                {{ typeMeta(task.type).label }}
              </span>
            </button>
          </div>

          <button type="button" class="task-picker__create" @click="createTask">
            <Plus :size="16" />
            Создать и привязать задачу
          </button>
        </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ChevronDown, Plus } from 'lucide-vue-next'
import type { Task, TaskType } from '~/types/task.types'

const props = withDefaults(
  defineProps<{
    modelValue: string[]
    tasks: Task[]
    label?: string
    showType?: boolean
    elsewhereIds?: string[]
  }>(),
  {
    label: 'Выбрать задачи',
    showType: false,
    elsewhereIds: () => [],
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
  (e: 'create'): void
}>()

const rootRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const query = ref('')
const menuPlacement = ref<'top' | 'bottom'>('bottom')
const menuStyle = ref<Record<string, string>>({})

const elsewhere = computed(() => new Set(props.elsewhereIds))

const visibleTasks = computed(() => {
  const needle = query.value.trim().toLowerCase()
  return props.tasks
    .filter((task) => !needle || task.title.toLowerCase().includes(needle))
    .map((task) => ({
      ...task,
      elsewhere: elsewhere.value.has(task.id) && !props.modelValue.includes(task.id),
    }))
})

const triggerLabel = computed(() => {
  const count = props.modelValue.length
  if (!count) return 'Выбрать задачи'
  return `Выбрано: ${count}`
})

function typeMeta(type: TaskType) {
  const map: Record<TaskType, { label: string; title: string }> = {
    HABIT: { label: 'П', title: 'Привычка' },
    TASK_DAY: { label: 'Д', title: 'День' },
    TASK_WEEK: { label: 'Н', title: 'Неделя' },
    TASK_MONTH: { label: 'М', title: 'Месяц' },
    TASK_YEAR: { label: 'Г', title: 'Год' },
    PURCHASE: { label: 'К', title: 'Покупка' },
  }
  return map[type]
}

function optionId(id: string) {
  return `board-task-${id}`
}

function open() {
  isOpen.value = true
  nextTick(() => {
    updateMenuPosition()
    const input = menuRef.value?.querySelector('input')
    input?.focus()
  })
}

function close() {
  isOpen.value = false
  query.value = ''
}

function toggle() {
  if (isOpen.value) close()
  else open()
}

function toggleTask(id: string) {
  if (elsewhere.value.has(id) && !props.modelValue.includes(id)) return
  const next = props.modelValue.includes(id)
    ? props.modelValue.filter((item) => item !== id)
    : [...props.modelValue, id]
  emit('update:modelValue', next)
}

function createTask() {
  close()
  emit('create')
}

function updateMenuPosition() {
  const root = rootRef.value
  if (!root || !isOpen.value) return

  const rect = root.getBoundingClientRect()
  const gap = 8
  const maxHeight = 320
  const availableBelow = window.innerHeight - rect.bottom - gap
  const availableAbove = rect.top - gap
  const openUp = availableBelow < 280 && availableAbove > availableBelow
  const menuHeight = Math.min(maxHeight, openUp ? availableAbove : availableBelow)

  menuPlacement.value = openUp ? 'top' : 'bottom'
  menuStyle.value = {
    left: `${rect.left}px`,
    top: openUp ? `${rect.top - gap}px` : `${rect.bottom + gap}px`,
    width: `${Math.max(rect.width, 280)}px`,
    maxHeight: `${Math.max(180, menuHeight)}px`,
    zIndex: 'var(--z-dropdown)',
  }
}

function handleDocumentPointerDown(event: PointerEvent) {
  const target = event.target as Node
  if (rootRef.value?.contains(target) || menuRef.value?.contains(target)) return
  close()
}

function handleDocumentKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !isOpen.value) return
  event.stopPropagation()
  close()
}

onMounted(() => {
  document.addEventListener('pointerdown', handleDocumentPointerDown)
  document.addEventListener('keydown', handleDocumentKeydown)
  window.addEventListener('resize', updateMenuPosition)
  window.addEventListener('scroll', updateMenuPosition, true)
})

onBeforeUnmount(() => {
  close()
  document.removeEventListener('pointerdown', handleDocumentPointerDown)
  document.removeEventListener('keydown', handleDocumentKeydown)
  window.removeEventListener('resize', updateMenuPosition)
  window.removeEventListener('scroll', updateMenuPosition, true)
})
</script>

<style scoped lang="scss">
.task-picker {
  position: relative;
  width: 100%;
  min-width: 0;
}

.task-picker__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  width: 100%;
  @include form-control;
  height: var(--control-height-md);
  padding-inline: var(--space-4) var(--space-3);
  border: var(--ui-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-1);
  box-shadow: var(--shadow-xs);
  color: var(--color-text-primary);
  font: inherit;
  text-align: start;
  cursor: pointer;

  &:hover,
  &:focus-visible,
  .open & {
    border-color: color-mix(in srgb, var(--color-accent) 45%, var(--ui-border-color));
  }
}

.task-picker__value {
  @include text-ellipsis;
}

.task-picker__arrow {
  flex: 0 0 auto;
  color: var(--color-text-secondary);
  transition: transform var(--transition-standard);

  .open & {
    transform: rotate(180deg);
  }
}

.task-picker__menu {
  @include frosted;
  @include nest-shell(var(--radius-md), var(--space-1));
  position: fixed;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
  overflow: hidden;
  background-color: var(--color-surface-1);
  box-shadow: var(--shadow-md);

  &.top {
    transform: translateY(-100%);
  }
}

.task-picker__search {
  flex: 0 0 auto;
  padding: var(--space-1);
}

.task-picker__list {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--space-1);
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
}

.task-picker__empty {
  @include meta-text;
  padding: var(--space-3);
  text-align: center;
}

.task-picker__option {
  @include nest-item;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  min-width: 0;
  min-height: var(--control-height-sm);
  padding: var(--space-2);
  border: none;
  background: transparent;
  color: var(--color-text-primary);
  font: inherit;
  text-align: start;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  }

  &.selected {
    background: color-mix(in srgb, var(--color-accent) 14%, transparent);
  }

  &.elsewhere {
    cursor: default;
    opacity: 0.62;
  }
}

.task-picker__check {
  width: var(--control-glyph);
  height: var(--control-glyph);
  flex: 0 0 var(--control-glyph);
  border: var(--ui-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface-1);

  .selected & {
    border-color: var(--color-accent);
    background: var(--color-accent);
    box-shadow: inset 0 0 0 2px var(--color-surface-1);
  }
}

.task-picker__copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.task-picker__title {
  @include text-ellipsis;
  font-size: var(--body-size);
  line-height: var(--body-leading);
}

.task-picker__hint {
  @include meta-text;
  font-size: var(--caption-size);
  line-height: var(--caption-leading);
}

.task-picker__marker {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--space-6);
  height: var(--space-6);
  flex: 0 0 auto;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  color: var(--color-text-secondary);
  font-size: var(--caption-size);
  font-weight: var(--weight-bold);
}

.task-picker__create {
  @include nest-item;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  min-height: var(--control-height-sm);
  padding: var(--space-2);
  border: none;
  background: transparent;
  color: var(--color-text-primary);
  font: inherit;
  font-size: var(--body-size);
  font-weight: var(--weight-medium);
  cursor: pointer;

  &:hover,
  &:focus-visible {
    background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  }
}
</style>
