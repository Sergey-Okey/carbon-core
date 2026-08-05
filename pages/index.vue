<template>
  <div
    class="dashboard page-enter-stack"
    :class="{ 'is-board': uiStore.activeNav === 'board' }"
  >
    <section
      v-if="
        uiStore.activeNav !== 'board' &&
        settingsStore.showTopStats &&
        (uiStore.activeNav !== 'settings' || settingsStore.showSettingsStats)
      "
      class="dashboard-section stats"
    >
      <StatsOverview />
    </section>

    <section
      class="dashboard-section content-section"
      :class="{ 'is-board': uiStore.activeNav === 'board' }"
    >
      <BranchFlow v-if="uiStore.activeNav === 'board'" />

      <div v-if="uiStore.activeNav === 'tasks'" class="tasks-dashboard page-enter-stack">
        <TaskToolbar
          v-model:search="taskSearch"
          v-model:selected-tag-id="selectedTagId"
          v-model:view="taskView"
          :tag-options="tagOptions"
        />

        <EmptyState
          v-if="isTasksEmpty"
          class="tasks-empty-overview"
          title="Задач пока нет"
          description="Добавьте первую привычку или задачу через кнопку плюс в нужном блоке."
        />

        <TaskSections
          :show-active-sections="showActiveSections"
          :show-completed-section="showCompletedSection"
          :habits="visibleHabits"
          :day-tasks="visibleDayTasks"
          :week-tasks="visibleWeekTasks"
          :month-tasks="visibleMonthTasks"
          :year-tasks="visibleYearTasks"
          :completed-tasks="visibleCompletedTasks"
          :deleted-tasks="visibleDeletedTasks"
          @add="openTaskCreator"
          @edit="openTaskEditor"
        />

        <Teleport to="body">
          <TaskForm
            v-if="showTaskForm"
            :task="editingTask"
            :default-type="activeTaskType"
            @close="closeTaskForm"
            @save="handleTaskSave"
          />
        </Teleport>
      </div>

      <div v-show="uiStore.activeNav === 'shop'">
        <FocusPanel />
      </div>
      <AnalyticsPanel v-if="uiStore.activeNav === 'analytics'" />
      <SettingsPanel v-if="uiStore.activeNav === 'settings'" />
    </section>

    <GuidedTourOverlay />
  </div>
</template>

<script setup lang="ts">
import type { Task, TaskType } from '~/types/task.types'

useSeoMeta({
  title: 'Приложение',
  description: 'Личное пространство Core of Life.',
  robots: 'noindex, nofollow',
})

const uiStore = useUIStore()
const settingsStore = useSettingsStore()
const tasksStore = useTasksStore()
const guidedTour = useGuidedTourStore()
const { success, warning } = useNotification()
const { saveTask } = useTaskActions()
const showTaskForm = ref(false)
const activeTaskType = ref<TaskType>('TASK_DAY')
const editingTask = ref<Task | undefined>(undefined)
const {
  taskSearch,
  selectedTagId,
  taskView,
  tagOptions,
  isTasksEmpty,
  showActiveSections,
  showCompletedSection,
  visibleHabits,
  visibleDayTasks,
  visibleWeekTasks,
  visibleMonthTasks,
  visibleYearTasks,
  visibleCompletedTasks,
  visibleDeletedTasks,
} = useTaskFilters()

function openTaskCreator(type: TaskType) {
  if (!tasksStore.canAddTask(type)) {
    warning('Лимит задач на этот период исчерпан')
    return
  }

  activeTaskType.value = type
  editingTask.value = undefined
  showTaskForm.value = true
  guidedTour.handleAction(type === 'HABIT' ? 'habit-form-open' : 'task-form-open')
}

function openTaskEditor(task: Task) {
  activeTaskType.value = task.type
  editingTask.value = task
  showTaskForm.value = true
}

watch(
  () => uiStore.pendingNavTarget,
  (target) => {
    if (!target || target.kind !== 'task') return
    const task = tasksStore.tasks.find((item) => item.id === target.id)
    uiStore.clearPendingNavTarget()
    if (!task) return
    openTaskEditor(task)
  }
)

function closeTaskForm() {
  showTaskForm.value = false
  editingTask.value = undefined
}

function handleTaskSave(taskData: Partial<Task> & { createBranch?: boolean }) {
  const saved = saveTask(taskData, {
    editingTask: editingTask.value,
    fallbackType: activeTaskType.value,
  })
  if (saved) {
    const savedType = (taskData.type as TaskType | undefined) || activeTaskType.value
    guidedTour.handleAction(savedType === 'HABIT' ? 'habit-created' : 'task-created')
    closeTaskForm()
  }
}
</script>

<style scoped lang="scss">
.dashboard {
  display: flex;
  flex-direction: column;
  gap: clamp(16px, 2vw, 24px);

  &:not(.is-board) {
    inline-size: min(100%, 1600px);
    margin-inline: auto;
  }

  @include desktop {
    min-block-size: 100%;
  }

  @include mobile {
    gap: var(--space-3);
  }

  @include tablet {
    gap: var(--space-3);
  }

  &.is-board {
    gap: 0;
    block-size: 100%;
    min-block-size: 0;
    overflow: hidden;
    width: 100%;
    height: 100dvh;

    @include mobile {
      flex: 1;
      block-size: 100%;
      height: 100%;
      min-block-size: 0;
      overflow: hidden;
    }
  }
}

.content-section {
  min-block-size: min(400px, 60dvh);
  @include desktop {
    min-block-size: 0;
  }

  @include mobile {
    min-block-size: 0;
  }

  &.is-board {
    flex: 1;
    min-block-size: 0;
    block-size: 100%;
    overflow: hidden;

    @include mobile {
      flex: 1;
      block-size: 100%;
      height: 100%;
      min-block-size: 0;
      overflow: hidden;
    }
  }
}

.tasks-dashboard {
  display: flex;
  flex-direction: column;
  gap: clamp(16px, 2vw, 24px);
}

.tasks-empty-overview {
  margin-block: var(--space-2);
}

</style>
