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
          :disabled="disableToggle || (task.type !== 'HABIT' && task.done)"
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
  if (props.disableToggle) return

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

  addNotification({
    type: 'info',
    message: `«${props.task.title}» удалено`,
  })
  emit('delete', props.task.id)
}
</script>

<style scoped lang="scss">
.task-card {
  padding: 14px;
  background: color-mix(in srgb, var(--surface) 74%, transparent);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  transition:
    background var(--transition-standard),
    border-color var(--transition-standard),
    box-shadow var(--transition-standard),
    transform var(--transition-standard);

  &:hover {
    background: color-mix(in srgb, var(--surface) 88%, transparent);
    border-color: color-mix(in srgb, var(--accent) 28%, var(--border));
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }

  &.completed {
    filter: grayscale(1);
    opacity: 0.62;
  }

  &.overdue {
    border-left: 4px solid var(--error);
  }

  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }

  .tags {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }

  .tag {
    font-size: 0.7rem;
    padding: 3px 8px;
    background: color-mix(in srgb, var(--surface) 86%, transparent);
    border: 1px solid var(--border);
    border-radius: 12px;
    color: var(--accent);
  }

  .task-type {
    font-size: 0.7rem;
    padding: 4px 8px;
    border-radius: 12px;
    background: color-mix(in srgb, var(--border) 72%, transparent);
    text-transform: uppercase;
    color: var(--accent);
    white-space: nowrap;
    &.HABIT {
      background: color-mix(in srgb, var(--success) 15%, transparent);
    }
    &.PURCHASE {
      background: color-mix(in srgb, var(--gold) 15%, transparent);
    }
  }

  h4 {
    margin: 0 0 5px;
    font-size: 1rem;
    font-weight: 600;
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
    gap: 12px;
    margin-top: 12px;
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
      background: color-mix(in srgb, var(--surface) 90%, transparent);
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

    .task-header {
      align-items: flex-start;
    }

    .task-type {
      align-self: flex-start;
    }

    .task-footer {
      align-items: flex-start;
      flex-direction: column;
    }

    .actions {
      width: 100%;
      justify-content: flex-end;
      margin-left: 0;
    }
  }
}
</style>
