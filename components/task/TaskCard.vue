<template>
  <GlassCard
    class="task-card"
    :class="[task.type, { completed: isVisuallyCompleted, 'habit-checked': isHabitDoneToday, overdue: isOverdue }]"
  >
    <div class="task-header">
      <h4>{{ task.title }}</h4>
      <span class="task-type" :class="task.type">{{ typeLabel }}</span>
    </div>

    <p v-if="task.description">{{ task.description }}</p>

    <div class="task-footer">
      <div class="task-meta">
        <div v-if="task.type !== 'HABIT' && task.targetDate" class="due-date">
          <Calendar :size="14" />
          {{ formattedDate }}
        </div>
        <div v-if="isHabitDoneToday" class="habit-status">
          <CheckCircle :size="13" />
          Сегодня выполнена
        </div>
        <div v-if="taskTags.length" class="tags">
          <span
            v-for="tag in taskTags"
            :key="tag.id"
            class="tag"
            :title="tag.name"
            :style="{ '--tag-color': tag.color || 'var(--accent)' }"
          >
            <span class="tag-dot" />
            <span class="tag-name">{{ tag.name }}</span>
          </span>
        </div>
      </div>
      <div class="actions">
        <button
          class="complete-btn"
          :class="{ done: isCompleted }"
          @click="handleToggle"
          :disabled="disableToggle || isCompleted"
          :title="completeButtonTitle"
        >
          <CheckCircle v-if="isCompleted" :size="22" />
          <Circle v-else :size="22" />
        </button>
        <button class="edit-btn" title="Редактировать" @click.stop="emit('edit', task)">
          <Edit :size="18" />
        </button>
        <button class="delete-btn" title="Удалить" @click.stop="handleDelete">
          <Trash2 :size="18" />
        </button>
      </div>
    </div>
  </GlassCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '~/types/task.types'
import GlassCard from '~/components/base/GlassCard.vue'
import { CheckCircle, Circle, Trash2, Edit, Calendar } from 'lucide-vue-next'
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

const typeLabel = computed(() => {
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

const isCompleted = computed(() => {
  if (props.task.done) return true
  return false
})

const isHabitDoneToday = computed(() => {
  if (props.task.type !== 'HABIT' || !props.task.lastCompletedAt) return false
  return getLocalDateKey(new Date(props.task.lastCompletedAt)) ===
    getLocalDateKey(new Date())
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
  padding: 16px;
  transition:
    border-color var(--transition-standard),
    transform var(--transition-standard);

  &:hover {
    border-color: color-mix(in srgb, var(--accent) 28%, var(--border));
    transform: translateY(-1px);
  }

  &.completed {
    opacity: 0.7;

    h4 {
      text-decoration: line-through;
      text-decoration-color: color-mix(in srgb, var(--accent) 55%, transparent);
      text-decoration-thickness: 2px;
    }
  }

  &.habit-checked {
    .task-type.HABIT {
      background: color-mix(in srgb, var(--success) 22%, transparent);
    }
  }

  &.HABIT {
    min-height: 132px;
  }

  &.overdue {
    &::before {
      position: absolute;
      inset: 0 auto 0 0;
      width: 4px;
      background: var(--error);
      content: '';
    }
  }

  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 10px;
  }

  h4 {
    min-width: 0;
    margin: 0;
    color: var(--accent);
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.35;
    word-break: break-word;
  }

  p {
    margin: 0 0 14px;
    color: var(--dim);
    font-size: 0.86rem;
    line-height: 1.45;
    word-break: break-word;
  }

  .task-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    min-width: 0;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .tag {
    @include glass;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    max-width: 160px;
    font-size: 0.7rem;
    padding: 4px 8px;
    border: 1px solid color-mix(in srgb, var(--tag-color) 28%, var(--border));
    border-radius: var(--border-radius-sm);
    color: var(--accent);
  }

  .tag-dot {
    flex: 0 0 auto;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--tag-color);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--tag-color) 12%, transparent);
  }

  .tag-name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .task-type {
    flex-shrink: 0;
    font-size: 0.7rem;
    padding: 4px 8px;
    border-radius: var(--border-radius-sm);
    background: color-mix(in srgb, var(--border) 72%, transparent);
    text-transform: uppercase;
    color: var(--accent);
    white-space: nowrap;

    &.HABIT {
      background: color-mix(in srgb, var(--success) 15%, transparent);
      color: var(--success);
    }
    &.TASK_DAY {
      background: color-mix(in srgb, var(--accent) 12%, transparent);
      color: var(--accent);
    }
    &.TASK_WEEK {
      background: color-mix(in srgb, var(--silver) 16%, transparent);
      color: var(--silver);
    }
    &.TASK_MONTH {
      background: color-mix(in srgb, var(--gold) 15%, transparent);
      color: var(--gold);
    }
    &.TASK_YEAR {
      background: color-mix(in srgb, var(--platinum) 16%, transparent);
      color: var(--platinum);
    }
    &.PURCHASE {
      background: color-mix(in srgb, var(--gold) 15%, transparent);
      color: var(--gold);
    }
  }

  .task-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-top: 12px;
  }

  .due-date {
    display: flex;
    align-items: center;
    gap: 4px;
    min-height: 24px;
    font-size: 0.8rem;
    color: var(--dim);
    white-space: nowrap;
  }

  .habit-status {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-height: 24px;
    padding: 3px 7px;
    border-radius: var(--border-radius-sm);
    background: color-mix(in srgb, var(--success) 10%, transparent);
    color: var(--success);
    font-size: 0.72rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .actions {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
    margin-left: auto;
  }

  .actions button {
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: var(--dim);
    background: transparent;
    border: none;
    cursor: pointer;
    transition:
      background var(--transition-standard),
      color var(--transition-standard);

    &:hover:not(:disabled) {
      color: var(--accent);
    }
  }

  .complete-btn {
    color: var(--dim);
    &:hover:not(:disabled) {
      color: var(--accent);
    }
    &.done {
      color: var(--success);
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .delete-btn,
  .edit-btn {
    color: var(--dim);
    &:hover {
      color: var(--accent);
    }
  }
  .delete-btn:hover {
    color: var(--error);
  }
}

@media (max-width: 480px) {
  .task-card {
    padding: 12px;

    .task-type {
      align-self: flex-start;
    }

    .task-footer {
      align-items: flex-start;
      flex-direction: column;
      gap: 10px;
    }

    .actions {
      width: 100%;
      justify-content: flex-end;
      margin-left: 0;
    }

    &.HABIT {
      min-height: 116px;

      .task-header {
        gap: 8px;
        margin-bottom: 8px;
      }

      h4 {
        font-size: 0.88rem;
        line-height: 1.25;
      }

      .task-type {
        display: none;
      }

      .task-footer {
        gap: 8px;
      }

      .actions {
        gap: 2px;
      }

      .actions button {
        width: 28px;
        height: 28px;
      }
    }
  }
}
</style>
