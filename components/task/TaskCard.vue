<template>
  <GlassCard
    class="task-card"
    variant="surface"
    no-padding
    :class="[task.type, { completed: isVisuallyCompleted, 'habit-checked': isHabitDoneToday, overdue: isOverdue }]"
  >
    <div class="task-card__body">
      <div class="task-header">
        <div class="title-row">
          <h4>{{ task.title }}</h4>
        </div>
        <div class="task-status">
          <button
            v-if="isHabitDoneToday"
            type="button"
            class="habit-done-icon"
            aria-label="Сегодня выполнена"
            data-tooltip="Сегодня выполнена"
          >
            <Check :size="14" />
          </button>
          <span
            v-if="task.type !== 'HABIT'"
            class="task-type"
            :class="task.type"
            :aria-label="typeTitle"
            :data-tooltip="typeTitle"
          >{{ typeLabel }}</span>
        </div>
      </div>

      <p
        class="task-desc"
        :class="{ 'task-desc--placeholder': !task.description?.trim() }"
      >
        {{ task.description?.trim() || 'Нет описания' }}
      </p>

      <div class="task-bottom">
        <div
          v-if="
            task.type === 'HABIT' ||
            linkedBranches.length ||
            taskTags.length ||
            (task.type !== 'HABIT' && !!(task.targetTime || task.targetDate))
          "
          class="task-info"
        >
          <span
            v-for="branch in linkedBranches"
            :key="branch.id"
            class="branch-link"
            :data-tooltip="branch.displayName"
          >
            {{ branch.displayName }}
          </span>
          <div v-if="task.type !== 'HABIT' && (task.targetTime || task.targetDate)" class="due-date">
            <Calendar :size="14" />
            {{ scheduleValue }}
          </div>

          <div class="tags-wrapper" v-if="taskTags.length">
            <button
              v-if="hasTagOverflow"
              type="button"
              class="scroll-btn scroll-left"
              :disabled="!canScrollBack"
              @click="scrollTags(-1)"
            >
              <ChevronLeft :size="14" />
            </button>

            <div
              ref="tagsElement"
              class="tags"
              :class="{
                'is-overflowing': hasTagOverflow,
                'can-scroll-back': canScrollBack,
                'can-scroll-forward': canScrollForward,
              }"
              @scroll="updateTagShadows"
            >
              <span
                v-for="tag in taskTags"
                :key="tag.id"
                class="tag"
                :aria-label="tag.name"
                :data-tooltip="tag.name"
                :style="{ '--tag-color': tag.color || 'var(--color-accent)' }"
              >
                <span class="tag-dot" />
                <span class="tag-name">{{ tag.name }}</span>
              </span>
            </div>

            <button
              v-if="hasTagOverflow"
              type="button"
              class="scroll-btn scroll-right"
              :disabled="!canScrollForward"
              @click="scrollTags(1)"
            >
              <ChevronRight :size="14" />
            </button>
          </div>
          <p v-else-if="task.type === 'HABIT'" class="meta-placeholder">Нет тегов</p>
        </div>

        <div class="actions">
          <button
            v-if="restoreMode"
            class="restore-btn"
            :aria-label="restoreButtonTitle"
            :data-tooltip="restoreButtonTitle"
            @click.stop="emit('restore', task.id)"
          >
            <RotateCcw :size="16" />
          </button>
          <template v-else>
            <button
              class="complete-btn"
              :class="{ done: isCompleted }"
              @click="handleToggle"
              :disabled="disableToggle || isCompleted"
              :aria-label="completeButtonTitle"
              :data-tooltip="completeButtonTitle"
              :data-tour="completeTourTarget"
            >
              <CheckCircle v-if="isCompleted" :size="18" />
              <Circle v-else :size="18" />
            </button>
            <button class="edit-btn" aria-label="Редактировать" data-tooltip="Редактировать" @click.stop="emit('edit', task)">
              <Edit :size="16" />
            </button>
            <button class="delete-btn" aria-label="Удалить" data-tooltip="Удалить" @click.stop="handleDelete">
              <Trash2 :size="16" />
            </button>
          </template>
        </div>
      </div>
    </div>
  </GlassCard>
</template>

<script setup lang="ts">
import type { Task } from '~/types/task.types'
import { CheckCircle, Check, Circle, Trash2, Edit, Calendar, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-vue-next'

const props = defineProps<{ task: Task; disableToggle?: boolean; restoreMode?: 'completed' | 'deleted' }>()
const emit = defineEmits<{
  (e: 'toggle', id: string): void
  (e: 'delete', id: string): void
  (e: 'edit', task: Task): void
  (e: 'restore', id: string): void
}>()

const tagsStore = useTagsStore()
const branchesStore = useBranchesStore()
const { success, info } = useNotification()
const { confirm } = useConfirm()

const taskTags = computed(() => {
  if (props.task.tags?.length) return props.task.tags
  return tagsStore.getTagsByIds(props.task.tagIds)
})
const linkedBranches = computed(() =>
  branchesStore.branches.filter(
    (branch) =>
      branch.directTaskIds?.includes(props.task.id) ||
      branch.milestones.some((milestone) => milestone.taskIds.includes(props.task.id))
  )
)

const tagsElement = ref<HTMLElement | null>(null)
const hasTagOverflow = ref(false)
const canScrollBack = ref(false)
const canScrollForward = ref(false)

function updateTagShadows() {
  const el = tagsElement.value
  if (!el) return

  const overflow = el.scrollWidth > el.clientWidth + 1
  hasTagOverflow.value = overflow
  if (!overflow) {
    canScrollBack.value = false
    canScrollForward.value = false
    return
  }

  canScrollBack.value = el.scrollLeft > 1
  canScrollForward.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
}

function scrollTags(direction: number) {
  const el = tagsElement.value
  if (!el) return

  const amount = el.clientWidth * 0.6
  el.scrollBy({ left: direction * amount, behavior: 'smooth' })
}

watch(taskTags, () => {
  nextTick(updateTagShadows)
})

onMounted(() => {
  nextTick(updateTagShadows)
  window.addEventListener('resize', updateTagShadows)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateTagShadows)
})

const typeLabel = computed(() => {
  const map: Record<string, string> = {
    HABIT: 'П',
    TASK_DAY: 'Д',
    TASK_WEEK: 'Н',
    TASK_MONTH: 'М',
    TASK_YEAR: 'Г',
    PURCHASE: 'К',
  }

  return map[props.task.type] || props.task.type.charAt(0).toUpperCase()
})
const completeTourTarget = computed(() =>
  props.task.type !== 'HABIT' && !props.task.done ? 'task-complete' : undefined
)

const typeTitle = computed(() => {
  const map: Record<string, string> = {
    HABIT: 'Привычка',
    TASK_DAY: 'День',
    TASK_WEEK: 'Неделя',
    TASK_MONTH: 'Месяц',
    TASK_YEAR: 'Год',
    PURCHASE: 'Покупка',
  }

  return map[props.task.type] || props.task.type
})

const scheduleValue = computed(() => {
  if (props.task.type === 'TASK_DAY' && props.task.targetTime) return props.task.targetTime
  if (!props.task.targetDate) return ''
  const d = new Date(props.task.targetDate)
  return d.toLocaleDateString('ru', { day: 'numeric', month: 'short' })
})

const isCompleted = computed(() => !!props.task.done)

const isHabitDoneToday = computed(() => {
  if (props.task.type !== 'HABIT' || !props.task.lastCompletedAt) return false
  return getLocalDateKey(new Date(props.task.lastCompletedAt)) === getLocalDateKey(new Date())
})

const isVisuallyCompleted = computed(() => props.task.type !== 'HABIT' && props.task.done)

const isOverdue = computed(() => {
  if (isVisuallyCompleted.value) return false
  if (!props.task.targetDate) return false
  return props.task.targetDate < new Date().toISOString().split('T')[0]
})

const completeButtonTitle = computed(() => {
  if (props.task.type === 'HABIT' && isHabitDoneToday.value) return 'Выполнить ещё раз'
  return 'Выполнить'
})
const restoreButtonTitle = computed(() =>
  props.restoreMode === 'deleted' ? 'Восстановить задачу' : 'Вернуть в активные'
)

function handleToggle() {
  if (props.disableToggle || (props.task.type !== 'HABIT' && isCompleted.value)) return

  success(
    props.task.type === 'HABIT'
      ? `Привычка «${props.task.title}» выполнена`
      : `Задача «${props.task.title}» выполнена`
  )

  emit('toggle', props.task.id)
}

function getLocalDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

async function handleDelete() {
  const ok = await confirm(`Удалить задачу «${props.task.title}»?`)
  if (!ok) return

  info(`«${props.task.title}» удалено`)

  emit('delete', props.task.id)
}
</script>

<style scoped lang="scss">
.task-card {
  /* Match AnalyticsWidgetShell card pad scale */
  --card-pad: var(--space-5);
  --card-gap: var(--space-3);

  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-height: 0;
  height: 100%;
  border-radius: var(--radius-lg);
  color: var(--color-text-primary);
  transition:
    background var(--transition-standard),
    border-color var(--transition-standard);

  &:hover {
    border-color: color-mix(in srgb, var(--color-accent) 28%, var(--ui-border-color));
  }

  &.habit-checked {
    border-color: color-mix(in srgb, var(--color-success) 28%, var(--ui-border-color));
  }

  &.overdue {
    border-color: color-mix(in srgb, var(--color-error) 28%, var(--ui-border-color));
    background: color-mix(in srgb, var(--color-error) 5%, var(--color-surface-1));
  }
}

.task-card__body {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: var(--card-gap);
  box-sizing: border-box;
  min-width: 0;
  min-height: 0;
  height: 100%;
  padding: var(--card-pad);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-3);
  flex: 0 0 auto;
  min-width: 0;
}

.title-row {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  min-width: 0;
  flex: 1 1 auto;
  flex-wrap: nowrap;
}

.task-status {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  flex-shrink: 0;
}

.habit-done-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: var(--space-5);
  height: var(--space-5);
  margin-top: 0;
  border-radius: var(--radius-full);
  border: none;
  background: color-mix(in srgb, var(--color-success) 15%, transparent);
  color: var(--color-success);
  cursor: pointer;
  transition:
    background var(--transition-standard),
    color var(--transition-standard);

  &:hover {
    background: color-mix(in srgb, var(--color-success) 25%, transparent);
  }
}

h4 {
  margin: 0;
  flex: 1 1 auto;
  min-width: 0;
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-tight);
  letter-spacing: -0.01em;
  @include text-clamp(2);
}

.task-desc {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  line-height: var(--leading-normal);
  overflow-wrap: break-word;
  word-break: normal;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  min-width: 0;
}

.task-desc--placeholder {
  opacity: 0.72;
  font-style: italic;
}

.meta-placeholder {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-style: italic;
  opacity: 0.72;
}

.task-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  margin-top: auto;
  flex: 0 0 auto;
  min-width: 0;
  flex-wrap: nowrap;
}

.task-info {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
  min-width: 0;
  flex: 1 1 auto;
}

.due-date {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  background: color-mix(in srgb, var(--color-accent) 6%, transparent);
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
  white-space: nowrap;
}

.branch-link {
  display: inline-block;
  max-width: 104px;
  padding: 2px var(--space-2);
  overflow: hidden;
  border: var(--ui-border);
  border-radius: var(--radius-full);
  color: var(--color-text-primary);
  font-size: var(--text-xs);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tags-wrapper {
  position: relative;
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.scroll-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  border: none;
  background: var(--color-surface-2);
  color: var(--color-text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background var(--transition-standard),
    color var(--transition-standard),
    opacity var(--transition-standard);
  z-index: 2;

  &:hover:not(:disabled) {
    background: var(--color-surface-2);
    color: var(--color-text-primary);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
}

.scroll-left {
  left: 0;
}

.scroll-right {
  right: 0;
}

.tags {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: var(--space-1);
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  padding: var(--space-1) 0;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.tag {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px var(--space-2);
  background: transparent;
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  color: var(--color-text-primary);
  white-space: nowrap;
  transition:
    background var(--transition-standard),
    color var(--transition-standard);

  &:hover {
    background: color-mix(in srgb, var(--tag-color, var(--color-accent)) 8%, transparent);
  }
}

.tag-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--tag-color, var(--color-accent));
}

.tag-name {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-type {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: var(--space-5);
  height: var(--space-5);
  margin: 0;
  padding: 0;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-text-muted) 14%, transparent);
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  line-height: 1;
  letter-spacing: 0;
  text-transform: uppercase;
  cursor: default;
  white-space: nowrap;
}

.actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  flex-shrink: 0;
  margin: 0;
  margin-inline-end: calc((var(--control-icon-size) - 16px) / -2);
  padding: 0;
}

.actions button {
  width: var(--control-icon-size);
  height: var(--control-icon-size);
  margin: 0;
  padding: 0;
  border-radius: var(--radius-full);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  transition:
    background var(--transition-standard),
    color var(--transition-standard);

  &:hover:not(:disabled) {
    background: var(--color-surface-2);
    color: var(--color-text-primary);
  }

  &:active:not(:disabled) {
    background: color-mix(in srgb, var(--color-accent) 12%, transparent);
  }
}

.complete-btn.done {
  color: var(--color-success);

  &:hover {
    background: color-mix(in srgb, var(--color-success) 15%, transparent);
    color: var(--color-success);
  }
}

.edit-btn:hover {
  color: var(--color-text-primary);
}

.delete-btn:hover {
  color: var(--color-error);
}

.restore-btn:hover {
  color: var(--color-success);
}

.complete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@include mobile {
  .task-card {
    --card-pad: var(--space-4);
    --card-gap: var(--space-3);
    min-height: 0;
  }

  .task-header {
    align-items: flex-start;
    gap: var(--space-2);
  }

  .title-row {
    gap: var(--space-1);
  }

  h4 {
    font-size: var(--text-sm);
  }

  /* Same composition as desktop: meta left, actions right */
  .task-bottom {
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    width: 100%;
  }

  .task-info {
    flex: 1 1 auto;
    min-width: 0;
  }

  .tags-wrapper {
    flex: 1 1 auto;
    min-width: 0;
    max-width: 100%;
  }

  .actions {
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    flex-shrink: 0;
    gap: var(--space-1);
    margin-inline-end: calc((40px - 16px) / -2);
  }

  .actions button {
    width: 40px;
    height: 40px;
  }

  .scroll-btn {
    width: 22px;
    height: 22px;
  }

  .branch-link {
    max-width: 88px;
  }

  .task-card.HABIT {
    --habit-rule: 1px solid color-mix(in srgb, var(--color-text-primary) 8%, transparent);
    height: auto;
    align-self: start;

    .task-card__body {
      flex: 0 0 auto;
      height: auto;
      align-items: stretch;
      text-align: start;
      gap: 0;
    }

    .task-header {
      flex-direction: row;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--space-2);
      width: 100%;
      padding-bottom: var(--space-3);
      margin-bottom: var(--space-3);
      border-bottom: var(--habit-rule);
    }

    .title-row {
      flex-direction: row;
      align-items: flex-start;
      justify-content: flex-start;
      width: auto;
      min-width: 0;
    }

    h4 {
      flex: 1 1 auto;
      width: auto;
      text-align: start;
    }

    .task-status {
      align-self: flex-start;
    }

    .task-desc {
      width: 100%;
      text-align: start;
      padding-bottom: var(--space-3);
      margin-bottom: var(--space-3);
      border-bottom: var(--habit-rule);
      -webkit-line-clamp: 3;
    }

    .task-desc--placeholder {
      display: -webkit-box;
    }

    .task-bottom {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-2);
      width: 100%;
      margin-top: 0;
    }

    .task-info {
      flex: 1 1 auto;
      justify-content: flex-start;
      width: auto;
      min-width: 0;
      padding-bottom: 0;
      margin-bottom: 0;
      border-bottom: none;
    }

    .tags-wrapper {
      flex: 0 1 auto;
      justify-content: flex-start;
      max-width: 100%;
    }

    .tags {
      justify-content: flex-start;
    }

    .meta-placeholder {
      @include text-ellipsis;
    }

    .actions {
      flex-direction: row;
      align-items: center;
      justify-content: flex-end;
      width: auto;
      margin-inline-end: calc((40px - 16px) / -2);
      padding-top: 0;
    }
  }
}

@include narrow {
  .task-card {
    --card-pad: var(--space-3);
    --card-gap: var(--space-2);
  }

  .task-header {
    gap: var(--space-2);
  }

  .tag-name {
    max-width: 72px;
  }
}
</style>