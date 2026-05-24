<template>
  <div class="task-sections">
  <template v-if="showActiveSections">
    <TaskList
      task-type="HABITS"
      title="Привычки"
      default-type="HABIT"
      external-form
      :tasks-override="habits"
      @add="emit('add', $event)"
      @edit="emit('edit', $event)"
    />

    <div class="task-section-grid">
      <TaskList
        task-type="TASK_DAY"
        title="Сегодня"
        default-type="TASK_DAY"
        external-form
        :tasks-override="dayTasks"
        @add="emit('add', $event)"
        @edit="emit('edit', $event)"
      />
      <TaskList
        task-type="TASK_WEEK"
        title="Неделя"
        default-type="TASK_WEEK"
        external-form
        :tasks-override="weekTasks"
        @add="emit('add', $event)"
        @edit="emit('edit', $event)"
      />
      <TaskList
        task-type="TASK_MONTH"
        title="Месяц"
        default-type="TASK_MONTH"
        external-form
        :tasks-override="monthTasks"
        @add="emit('add', $event)"
        @edit="emit('edit', $event)"
      />
      <TaskList
        task-type="TASK_YEAR"
        title="Год"
        default-type="TASK_YEAR"
        external-form
        :tasks-override="yearTasks"
        @add="emit('add', $event)"
        @edit="emit('edit', $event)"
      />
    </div>
  </template>

  <TaskList
    v-if="showCompletedSection"
    task-type="TASK_DAY"
    title="Завершённые"
    default-type="TASK_DAY"
    external-form
    hide-add
    hide-rule-hint
    disable-toggle
    :tasks-override="completedTasks"
    empty-text="Завершённых задач пока нет."
    @edit="emit('edit', $event)"
  />
  </div>
</template>

<script setup lang="ts">
import TaskList from '~/components/task/TaskList.vue'
import type { Task, TaskType } from '~/types/task.types'

defineProps<{
  showActiveSections: boolean
  showCompletedSection: boolean
  habits: Task[]
  dayTasks: Task[]
  weekTasks: Task[]
  monthTasks: Task[]
  yearTasks: Task[]
  completedTasks: Task[]
}>()

const emit = defineEmits<{
  (e: 'add', type: TaskType): void
  (e: 'edit', task: Task): void
}>()
</script>

<style scoped lang="scss">
.task-sections {
  display: grid;
  gap: 24px;
  padding-bottom: 24px;

  @include mobile {
    gap: 16px;
    padding-bottom: 112px;
  }
}

.task-section-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: 20px;

  @include mobile {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
