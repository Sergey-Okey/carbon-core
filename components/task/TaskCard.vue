<template>
  <GlassCard
    class="task-card"
    :class="[task.type, { completed: isVisuallyCompleted, 'habit-checked': isHabitDoneToday, overdue: isOverdue }]"
  >
    <div class="task-header">
      <div class="title-row">
        <h4>{{ task.title }}</h4>
        <button
          v-if="isHabitDoneToday"
          type="button"
          class="habit-done-icon"
          aria-label="Сегодня выполнена"
          data-tooltip="Сегодня выполнена"
        >
          <Check :size="14" />
        </button>
      </div>
      <span class="task-type" :class="task.type" :aria-label="typeTitle" :data-tooltip="typeTitle">{{ typeLabel }}</span>
    </div>

    <p v-if="task.description?.trim()" class="task-desc">{{ task.description.trim() }}</p>
    <p v-else class="task-desc task-desc--empty">Нет описания</p>

    <div class="task-bottom">
      <div class="task-info">
        <div v-if="task.type !== 'HABIT' && task.targetDate" class="due-date">
          <Calendar :size="14" />
          {{ formattedDate }}
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
              :aria-label="tag.name" :data-tooltip="tag.name"
              :style="{ '--tag-color': tag.color || 'var(--accent)' }"
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
        <p v-else class="no-tags">Нет тегов</p>
      </div>

      <div class="actions">
        <button
          class="complete-btn"
          :class="{ done: isCompleted }"
          @click="handleToggle"
          :disabled="disableToggle || isCompleted"
          :aria-label="completeButtonTitle" :data-tooltip="completeButtonTitle"
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
      </div>
    </div>
  </GlassCard>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import type { Task } from '~/types/task.types'
// @ts-ignore: Vue SFC default export type can be missing in editor service
import GlassCard from '~/components/base/GlassCard.vue'
import { CheckCircle, Check, Circle, Trash2, Edit, Calendar, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useTagsStore } from '~/stores/tags.store'
import { useNotification } from '~/composables/useNotification'
import { useConfirm } from '~/composables/useConfirm'

const props = defineProps<{ task: Task; disableToggle?: boolean }>()
const emit = defineEmits<{
  (e: 'toggle', id: string): void
  (e: 'delete', id: string): void
  (e: 'edit', task: Task): void
}>()

const tagsStore = useTagsStore()
const { addNotification } = useNotification()
const { confirm } = useConfirm()

const taskTags = computed(() => {
  if (props.task.tags?.length) return props.task.tags
  return tagsStore.getTagsByIds(props.task.tagIds)
})

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

const formattedDate = computed(() => {
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

function handleToggle() {
  if (props.disableToggle || (props.task.type !== 'HABIT' && isCompleted.value)) return

  addNotification({
    type: 'success',
    message:
      props.task.type === 'HABIT'
        ? `Привычка «${props.task.title}» выполнена`
        : `Задача «${props.task.title}» выполнена`,
  })

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

  addNotification({
    type: 'info',
    message: `«${props.task.title}» удалено`,
  })

  emit('delete', props.task.id)
}
</script>

<style scoped lang="scss">
.task-card {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 148px;
  height: 100%;
  padding: 1rem;
  background: transparent;
  border: var(--ui-border);
  border-radius: var(--border-radius-lg);
  transition:
    background var(--transition-standard),
    border-color var(--transition-standard);

  &:hover {
    border-color: var(--ui-border-color);
  }

  &.habit-checked {
    border-color: var(--ui-border-color);
  }

  &.overdue {
    border-color: color-mix(in srgb, var(--error) 28%, var(--ui-border-color));
    background: transparent;
  }

  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .title-row {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    flex-wrap: wrap;
  }

  .habit-done-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: none;
    background: color-mix(in srgb, var(--success) 15%, transparent);
    color: var(--success);
    cursor: pointer;
    transition:
      background var(--transition-standard),
      color var(--transition-standard);
    &:hover {
      background: color-mix(in srgb, var(--success) 25%, transparent);
    }
  }

  h4 {
    margin: 0;
    color: var(--text);
    font-size: 0.95rem;
    font-weight: 600;
    line-height: 1.3;
    word-break: break-word;
  }

  .task-desc {
    margin: 0 0 8px;
    color: var(--dim);
    font-size: 0.8rem;
    line-height: 1.4;
    word-break: break-word;
  }

  .task-desc--empty {
    opacity: 0.75;
    font-style: italic;
  }

  .task-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: auto;
    flex-wrap: nowrap;
  }

  .task-info {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    min-width: 0;
    flex: 1;
  }

  .due-date {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--dim);
    font-size: 0.75rem;
    background: color-mix(in srgb, var(--accent) 6%, transparent);
    padding: 2px 6px;
    border-radius: var(--border-radius-pill);
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
    border-radius: var(--border-radius-pill);
    border: none;
    background: var(--glass-surface);
    color: var(--dim);
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
      background: var(--glass-surface);
      color: var(--text);
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
    gap: 6px;
    flex: 1;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 4px 0;
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
    gap: 6px;
    padding: 2px 6px;
    background: transparent;
    border: none;
    border-radius: var(--border-radius-pill);
    font-size: 0.7rem;
    color: var(--tag-color, var(--accent));
    white-space: nowrap;
    transition:
      background var(--transition-standard),
      color var(--transition-standard);

    &:hover {
      background: color-mix(in srgb, var(--tag-color, var(--accent)) 8%, transparent);
    }
  }

  .tag-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--tag-color, var(--accent));
  }

  .tag-name {
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .no-tags {
    color: var(--dim);
    font-size: 0.75rem;
    margin-top: 2px;
  }

  .task-type {
    flex-shrink: 0;
    font-size: 0.7rem;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 20px;
    background: color-mix(in srgb, var(--dim) 15%, transparent);
    color: var(--dim);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    cursor: default;
    white-space: nowrap;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  .actions button {
    width: var(--control-icon-size);
    height: var(--control-icon-size);
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: var(--dim);
    cursor: pointer;
    transition:
      background var(--transition-standard),
      color var(--transition-standard),
      opacity var(--transition-standard),
      opacity var(--transition-standard);

    &:hover:not(:disabled) {
      background: var(--glass-surface);
      color: var(--text);
    }

    &:active:not(:disabled) {
      background: color-mix(in srgb, var(--accent) 12%, transparent);
    }
  }

  .complete-btn.done {
    color: var(--success);
    &:hover {
      background: color-mix(in srgb, var(--success) 15%, transparent);
      color: var(--success);
    }
  }

  .edit-btn:hover {
    color: var(--text);
  }
  .delete-btn:hover {
    color: var(--error);
  }

  .complete-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

@media (max-width: 560px) {
  .task-card {
    padding: 12px;
    min-height: auto;

    .task-header {
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 10px;
    }

    .title-row {
      flex: 1;
    }

    h4 {
      font-size: 0.9rem;
    }

    .task-type {
      align-self: center;
      margin-left: auto;
    }

    .task-desc {
      font-size: 0.75rem;
      margin-bottom: 10px;
    }

    .task-bottom {
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }

    .task-info {
      flex: 1;
      gap: 8px;
    }

    .due-date {
      font-size: 0.7rem;
      padding: 1px 6px;
    }

    .tags-wrapper {
      min-width: 0;
    }

    .tag {
      padding: 1px 6px;
      font-size: 0.65rem;
      .tag-name {
        max-width: 80px;
      }
    }

    .actions {
      margin-left: auto;
    }

    .actions button {
      width: 44px;
      height: 44px;
    }

    .scroll-btn {
      width: 20px;
      height: 20px;
    }

    .tags {
      padding: 2px 0;
    }
  }
}
</style>
