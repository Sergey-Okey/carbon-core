<template>
  <GlassCard
    class="task-card"
    :class="{ completed: task.done, overdue: isOverdue }"
  >
    <div class="task-header">
      <div class="tags">
        <span
          v-for="tag in taskTags"
          :key="tag.id"
          class="tag"
          :title="tag.name"
        >
          {{ tag.name }}
        </span>
      </div>
      <span class="task-type" :class="task.type">{{ typeLabel }}</span>
    </div>
    <h4>{{ task.title }}</h4>
    <p v-if="task.description">{{ task.description }}</p>
    <div class="task-footer">
      <div v-if="task.type !== 'HABIT' && task.targetDate" class="due-date">
        <Calendar :size="14" />
        {{ formattedDate }}
      </div>
      <div class="actions">
        <button
          class="complete-btn"
          :class="{ done: task.done }"
          @click="handleToggle"
          :disabled="task.type !== 'HABIT' && task.done"
        >
          <CheckCircle v-if="task.done" :size="22" />
          <Circle v-else :size="22" />
        </button>
        <button class="delete-btn" @click.stop="handleDelete">
          <Trash2 :size="18" />
        </button>
        <button class="edit-btn" @click.stop="emit('edit', task)">
          <Edit :size="18" />
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
import { useTasksStore } from '~/stores/tasks.store'
import { useNotification } from '~/composables/useNotification'
import { useConfirm } from '~/composables/useConfirm'

const props = defineProps<{ task: Task }>()
const emit = defineEmits<{
  (e: 'toggle', id: string): void
  (e: 'delete', id: string): void
  (e: 'edit', task: Task): void
}>()

const tagsStore = useTagsStore()
const tasksStore = useTasksStore()
const { addNotification } = useNotification()
const { confirm } = useConfirm()

const taskTags = computed(() => tagsStore.getTagsByIds(props.task.tagIds))

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

const isOverdue = computed(() => {
  if (props.task.done) return false
  if (!props.task.targetDate) return false
  return props.task.targetDate < new Date().toISOString().split('T')[0]
})

function handleToggle() {
  tasksStore.completeTask(props.task.id)
  addNotification({
    type: 'success',
    message:
      props.task.type === 'HABIT'
        ? `Привычка «${props.task.title}» выполнена`
        : `Задача «${props.task.title}» выполнена`,
  })
  emit('toggle', props.task.id)
}

async function handleDelete() {
  const ok = await confirm(`Удалить задачу «${props.task.title}»?`)
  if (!ok) return

  tasksStore.deleteTask(props.task.id)
  addNotification({
    type: 'info',
    message: `«${props.task.title}» удалено`,
  })
  emit('delete', props.task.id)
}
</script>

<style scoped lang="scss">
.task-card {
  padding: 16px;
  transition: all var(--transition-standard);

  &.completed {
    filter: grayscale(1);
    opacity: 0.5;
  }

  &.overdue {
    border-left: 4px solid var(--error);
  }

  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .tags {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }

  .tag {
    font-size: 0.7rem;
    padding: 2px 6px;
    background: var(--surface);
    border-radius: 12px;
    color: var(--accent);
  }

  .task-type {
    font-size: 0.7rem;
    padding: 2px 8px;
    border-radius: 12px;
    background: var(--border);
    text-transform: uppercase;
    color: var(--accent);
    &.HABIT {
      background: color-mix(in srgb, var(--success) 15%, transparent);
    }
    &.PURCHASE {
      background: color-mix(in srgb, var(--gold) 15%, transparent);
    }
  }

  h4 {
    margin: 8px 0 4px;
    font-size: 1rem;
    color: var(--accent);
    word-break: break-word;
  }

  p {
    font-size: 0.85rem;
    color: var(--dim);
    margin-bottom: 12px;
    word-break: break-word;
  }

  .task-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .due-date {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.8rem;
    color: var(--dim);
  }

  .actions {
    display: flex;
    gap: 4px;
    margin-left: auto;
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
</style>
