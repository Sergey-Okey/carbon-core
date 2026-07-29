<template>
  <div class="dashboard" :class="{ 'is-board': uiStore.activeNav === 'board' }">
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

      <div v-if="uiStore.activeNav === 'tasks'" class="tasks-dashboard">
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
import { ref } from 'vue'
import { useSettingsStore } from '~/stores/settings.store'
import { useTasksStore } from '~/stores/tasks.store'
import { useUIStore } from '~/stores/ui.store'
import { useNotification } from '~/composables/useNotification'
import { useTaskFilters } from '~/composables/useTaskFilters'
import { useTaskActions } from '~/composables/useTaskActions'
import AnalyticsPanel from '~/components/analytics/AnalyticsPanel.vue'
import BranchFlow from '~/components/branch/BranchFlow.vue'
import StatsOverview from '~/components/dashboard/StatsOverview.vue'
import FocusPanel from '~/components/focus/FocusPanel.vue'
import TaskForm from '~/components/task/TaskForm.vue'
import TaskSections from '~/components/task/TaskSections.vue'
import TaskToolbar from '~/components/task/TaskToolbar.vue'
import EmptyState from '~/components/ui/feedback/EmptyState.vue'
import SettingsPanel from '~/components/settings/SettingsPanel.vue'
import GuidedTourOverlay from '~/components/guided/GuidedTourOverlay.vue'
import { useGuidedTourStore } from '~/stores/guidedTour.store'
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
const { addNotification } = useNotification()
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
    addNotification({
      type: 'warning',
      message: 'Лимит задач на этот период исчерпан',
    })
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
  padding-block-end: 80px;

  &:not(.is-board) {
    inline-size: min(100%, 1600px);
    margin-inline: auto;
  }

  @include desktop {
    padding-block-end: 0;
    min-block-size: 100%;
  }

  &.is-board {
    gap: 0;
    block-size: 100%;
    min-block-size: 0;
    padding-block-end: 0;
    overflow: hidden;
    width: 100%;
    height: 100dvh;

    @include mobile {
      block-size: auto;
      min-block-size: 0;
      overflow: visible;
      padding-block-end: 84px;
    }
  }
}

.dashboard-section {
  animation: page-block-in 380ms ease-out both;

  &:nth-child(2) {
    animation-delay: 70ms;
  }
}

.content-section {
  min-block-size: min(400px, 60dvh);
  @include desktop {
    min-block-size: 0;
  }

  &.is-board {
    flex: 1;
    min-block-size: 0;
    block-size: 100%;
    overflow: hidden;

    @include mobile {
      flex: 0 0 auto;
      block-size: auto;
      overflow: visible;
    }
  }
}

.tasks-dashboard {
  display: flex;
  flex-direction: column;
  gap: clamp(16px, 2vw, 24px);

  > * {
    animation: page-block-in 360ms ease-out both;
  }

  > *:nth-child(2) {
    animation-delay: 55ms;
  }

  > *:nth-child(3) {
    animation-delay: 95ms;
  }
}

.tasks-empty-overview {
  margin-block: var(--space-2);
}

@keyframes page-block-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .dashboard-section,
  .tasks-dashboard > * {
    animation: none;
  }
}

</style>
