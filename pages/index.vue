<template>
  <div class="dashboard">
    <section
      v-if="uiStore.activeNav !== 'board'"
      class="dashboard-section stats"
    >
      <StatsOverview />
    </section>

    <section class="dashboard-section content-section">
      <BranchFlow v-if="uiStore.activeNav === 'board'" />

      <div v-if="uiStore.activeNav === 'tasks'" class="tasks-dashboard">
        <div class="tasks-toolbar">
          <div class="search-field">
            <label for="task-search">Поиск</label>
            <div class="control-wrapper">
              <Search :size="16" class="control-icon" />
              <input
                id="task-search"
                v-model.trim="taskSearch"
                type="search"
                placeholder="Название или описание"
              />
            </div>
          </div>

          <div class="filter-field">
            <label for="task-tag">Тег</label>
            <div class="tag-select" @focusout="closeTagMenuOnBlur">
              <Tags :size="16" class="control-icon" />
              <button
                id="task-tag"
                type="button"
                class="tag-select-button"
                :aria-expanded="isTagMenuOpen"
                aria-haspopup="listbox"
                @click="isTagMenuOpen = !isTagMenuOpen"
                @keydown.esc="isTagMenuOpen = false"
              >
                <span>{{ selectedTagLabel }}</span>
              </button>
              <ChevronDown :size="14" class="select-arrow" />
              <div v-if="isTagMenuOpen" class="tag-menu" role="listbox">
                <button
                  type="button"
                  class="tag-menu-item"
                  :class="{ active: selectedTagId === 'all' }"
                  role="option"
                  :aria-selected="selectedTagId === 'all'"
                  @click="selectTag('all')"
                >
                  Все теги
                </button>
                <button
                  v-for="tag in tagsStore.tags"
                  :key="tag.id"
                  type="button"
                  class="tag-menu-item"
                  :class="{ active: selectedTagId === tag.id }"
                  role="option"
                  :aria-selected="selectedTagId === tag.id"
                  @click="selectTag(tag.id)"
                >
                  {{ tag.name }}
                </button>
              </div>
            </div>
          </div>

          <div class="view-switch" aria-label="Режим задач">
            <span class="control-label">Режим</span>
            <div class="segment-row">
              <button
                type="button"
                :class="{ active: taskView === 'active' }"
                @click="taskView = 'active'"
              >
                Активные
              </button>
              <button
                type="button"
                :class="{ active: taskView === 'all' }"
                @click="taskView = 'all'"
              >
                Все
              </button>
              <button
                type="button"
                :class="{ active: taskView === 'completed' }"
                @click="taskView = 'completed'"
              >
                Завершённые
              </button>
            </div>
          </div>

        </div>

        <div v-if="isTasksEmpty" class="tasks-empty-overview">
          <h3>Задач пока нет</h3>
          <p>Добавьте первую привычку или задачу через кнопку плюс в нужном блоке.</p>
        </div>

        <template v-if="showActiveSections">
          <TaskList
            task-type="HABITS"
            title="Привычки"
            default-type="HABIT"
            external-form
            :tasks-override="visibleHabits"
            @add="openTaskCreator"
            @edit="openTaskEditor"
          />

          <div class="horizons-grid">
            <TaskList
              task-type="TASK_DAY"
              title="Сегодня (макс. 3)"
              default-type="TASK_DAY"
              external-form
              :tasks-override="visibleDayTasks"
              @add="openTaskCreator"
              @edit="openTaskEditor"
            />
            <TaskList
              task-type="TASK_WEEK"
              title="Неделя (макс. 3)"
              default-type="TASK_WEEK"
              external-form
              :tasks-override="visibleWeekTasks"
              @add="openTaskCreator"
              @edit="openTaskEditor"
            />
            <TaskList
              task-type="TASK_MONTH"
              title="Месяц (макс. 3)"
              default-type="TASK_MONTH"
              external-form
              :tasks-override="visibleMonthTasks"
              @add="openTaskCreator"
              @edit="openTaskEditor"
            />
            <TaskList
              task-type="TASK_YEAR"
              title="Год (макс. 3)"
              default-type="TASK_YEAR"
              external-form
              :tasks-override="visibleYearTasks"
              @add="openTaskCreator"
              @edit="openTaskEditor"
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
          :tasks-override="visibleCompletedTasks"
          empty-text="Завершённых задач пока нет."
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

      <RewardList v-if="uiStore.activeNav === 'shop'" />
      <AnalyticsPanel v-if="uiStore.activeNav === 'analytics'" />
      <SettingsPanel v-if="uiStore.activeNav === 'settings'" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronDown, Search, Tags } from 'lucide-vue-next'
import { useBranchesStore } from '~/stores/branches.store'
import { useTagsStore } from '~/stores/tags.store'
import { useTasksStore } from '~/stores/tasks.store'
import { useUIStore } from '~/stores/ui.store'
import { useNotification } from '~/composables/useNotification'
import AnalyticsPanel from '~/components/analytics/AnalyticsPanel.vue'
import BranchFlow from '~/components/branch/BranchFlow.vue'
import StatsOverview from '~/components/dashboard/StatsOverview.vue'
import RewardList from '~/components/shop/RewardList.vue'
import TaskForm from '~/components/task/TaskForm.vue'
import TaskList from '~/components/task/TaskList.vue'
import SettingsPanel from '~/components/settings/SettingsPanel.vue'
import type { Task, TaskType } from '~/types/task.types'

type TaskView = 'active' | 'all' | 'completed'

const uiStore = useUIStore()
const tasksStore = useTasksStore()
const tagsStore = useTagsStore()
const branchesStore = useBranchesStore()
const { addNotification } = useNotification()

const taskSearch = ref('')
const selectedTagId = ref('all')
const isTagMenuOpen = ref(false)
const taskView = ref<TaskView>('active')
const showTaskForm = ref(false)
const activeTaskType = ref<TaskType>('TASK_DAY')
const editingTask = ref<Task | undefined>(undefined)

const isTasksEmpty = computed(() => tasksStore.tasks.length === 0)
const showActiveSections = computed(() => taskView.value !== 'completed')
const showCompletedSection = computed(() => taskView.value !== 'active')

const visibleHabits = computed(() =>
  tasksStore.getHabits().filter((task) => matchesTaskFilters(task))
)
const visibleDayTasks = computed(() => getVisibleTasksByType('TASK_DAY'))
const visibleWeekTasks = computed(() => getVisibleTasksByType('TASK_WEEK'))
const visibleMonthTasks = computed(() => getVisibleTasksByType('TASK_MONTH'))
const visibleYearTasks = computed(() => getVisibleTasksByType('TASK_YEAR'))
const visibleCompletedTasks = computed(() =>
  tasksStore.tasks
    .filter((task) => task.done || isHabitCompletedToday(task))
    .filter((task) => matchesTaskFilters(task))
    .sort((a, b) => getCompletedTime(b) - getCompletedTime(a))
)
const selectedTagLabel = computed(() => {
  if (selectedTagId.value === 'all') return 'Все теги'
  return tagsStore.tags.find((tag) => tag.id === selectedTagId.value)?.name || 'Все теги'
})

function getVisibleTasksByType(type: TaskType): Task[] {
  return tasksStore.getTasksByType(type).filter((task) => matchesTaskFilters(task))
}

function matchesTaskFilters(task: Task): boolean {
  if (selectedTagId.value !== 'all' && !task.tagIds.includes(selectedTagId.value)) {
    return false
  }

  const query = taskSearch.value.trim().toLowerCase()
  if (!query) return true

  return [task.title, task.description || ''].some((value) =>
    value.toLowerCase().includes(query)
  )
}

function isHabitCompletedToday(task: Task): boolean {
  if (task.type !== 'HABIT' || !task.lastCompletedAt) return false
  return new Date(task.lastCompletedAt).toISOString().split('T')[0] ===
    new Date().toISOString().split('T')[0]
}

function getCompletedTime(task: Task): number {
  return task.completedAt || task.lastCompletedAt || task.updatedAt || task.createdAt
}

function selectTag(tagId: string) {
  selectedTagId.value = tagId
  isTagMenuOpen.value = false
}

function closeTagMenuOnBlur(event: FocusEvent) {
  const currentTarget = event.currentTarget as HTMLElement | null
  const nextTarget = event.relatedTarget as Node | null
  if (currentTarget && nextTarget && currentTarget.contains(nextTarget)) return
  isTagMenuOpen.value = false
}

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
  const { createBranch, ...cleanTaskData } = taskData

  if (editingTask.value) {
    tasksStore.updateTask(editingTask.value.id, cleanTaskData)
    addNotification({ type: 'success', message: 'Задача обновлена' })
    closeTaskForm()
    return
  }

  const result = tasksStore.addTask({
    ...cleanTaskData,
    type: activeTaskType.value,
    tagIds: cleanTaskData.tagIds || [],
  })

  if (!result) {
    addNotification({ type: 'error', message: 'Не удалось добавить задачу' })
    return
  }

  if (createBranch && result.type !== 'HABIT') {
    branchesStore.addBranch(result.title, 'help-circle', result.description || '', [result.id])
    addNotification({
      type: 'success',
      message: `Ветка «${result.title}» создана в доске`,
    })
  } else {
    addNotification({
      type: 'success',
      message:
        result.type === 'HABIT'
          ? `Привычка «${result.title}» добавлена`
          : `«${result.title}» добавлено`,
    })
  }

  closeTaskForm()
}
</script>

<style scoped lang="scss">
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 80px;

  @include desktop {
    padding-bottom: 0;
    height: 100vh;
    overflow-y: auto;
  }
}

.content-section {
  min-height: 400px;
  @include desktop {
    height: calc(100vh - 180px);
    overflow-y: auto;
  }
}

.tasks-dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Улучшенная панель инструментов */
.tasks-toolbar {
  @include glass;
  position: relative;
  z-index: 30;
  display: grid;
  grid-template-columns: minmax(220px, 1.25fr) minmax(180px, 0.85fr) minmax(292px, auto);
  gap: 20px;
  align-items: end;
  padding: 20px 24px;
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border);
  background: color-mix(in srgb, var(--surface) 70%, transparent);
  backdrop-filter: blur(8px);

  @include mobile {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px;
  }

  label,
  .control-label {
    display: block;
    margin-bottom: 6px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--dim);
  }

    .control-wrapper {
    position: relative;
    display: flex;
    align-items: center;

    input,
    select {
      width: 100%;
      height: 40px;
      padding: 0 32px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--border-radius-md);
      color: var(--accent);
      font-size: 0.9rem;
      transition: all var(--transition-standard);

      &:focus {
        border-color: var(--accent);
        outline: none;
        box-shadow: 0 0 0 1px var(--accent);
      }

      &::placeholder {
        color: var(--dim);
        opacity: 0.7;
      }
    }

    select {
      appearance: none;
      cursor: pointer;
      padding-right: 32px;
    }
  }

  .tag-select {
    position: relative;
    display: flex;
    align-items: center;
  }

  .tag-select-button {
    width: 100%;
    height: 40px;
    padding: 0 32px;
    overflow: hidden;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--border-radius-md);
    color: var(--accent);
    font: inherit;
    font-size: 0.9rem;
    text-align: left;
    cursor: pointer;
    transition: all var(--transition-standard);

    span {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &:focus {
      border-color: var(--accent);
      outline: none;
      box-shadow: 0 0 0 1px var(--accent);
    }
  }

  .tag-menu {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    z-index: 60;
    max-height: 240px;
    padding: 6px;
    overflow-y: auto;
    background: color-mix(in srgb, var(--surface) 94%, transparent);
    border: 1px solid var(--border);
    border-radius: var(--border-radius-md);
    box-shadow: var(--shadow-md);
    backdrop-filter: blur(8px);
  }

  .tag-menu-item {
    width: 100%;
    min-height: 36px;
    padding: 0 10px;
    border: none;
    border-radius: var(--border-radius-sm);
    background: transparent;
    color: var(--accent);
    font: inherit;
    font-size: 0.88rem;
    text-align: left;
    cursor: pointer;
    transition:
      background var(--transition-standard),
      color var(--transition-standard);

    &:hover,
    &.active {
      background: color-mix(in srgb, var(--accent) 12%, transparent);
      color: var(--accent);
    }

    &.active {
      font-weight: 600;
    }
  }

  .control-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--dim);
    pointer-events: none;
    width: 16px;
    height: 16px;
  }

  .select-arrow {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--dim);
    pointer-events: none;
  }
}

/* Сегментные кнопки (режим) */
.segment-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  height: 40px;
  padding: 3px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--border-radius-md);

  button {
    margin: 0;
    padding: 0 8px;
    border: none;
    border-radius: calc(var(--border-radius-sm) - 2px);
    background: transparent;
    color: var(--dim);
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;

    &.active {
      background: var(--accent);
      color: var(--bg);
      box-shadow: var(--shadow-sm);
    }

    &:hover:not(.active) {
      background: color-mix(in srgb, var(--accent) 10%, transparent);
      color: var(--accent);
    }
  }
}

/* Пустое состояние задач */
.tasks-empty-overview {
  @include glass;
  padding: 32px 24px;
  text-align: center;
  border-radius: var(--border-radius-lg);
  background: color-mix(in srgb, var(--surface) 60%, transparent);
  backdrop-filter: blur(8px);
  border: 1px solid var(--border);

  h3 {
    margin: 0 0 8px;
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--accent);
  }

  p {
    margin: 0;
    color: var(--dim);
    font-size: 0.9rem;
    line-height: 1.5;
  }
}

/* Сетка горизонтов (списки задач) */
.horizons-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;

  @include mobile {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

/* Адаптивность для мелких экранов */
@media (max-width: 768px) {
  .tasks-toolbar {
    gap: 14px;
  }

  .segment-row button {
    font-size: 0.8rem;
    padding: 0 6px;
  }
}

@media (max-width: 480px) {
  .tasks-toolbar {
    padding: 12px;
  }

  .segment-row button {
    font-size: 0.75rem;
  }
}
</style>
