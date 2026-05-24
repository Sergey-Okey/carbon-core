import { computed, ref } from 'vue'
import { useTagsStore } from '~/stores/tags.store'
import { useTasksStore } from '~/stores/tasks.store'
import type { AppSelectOption } from '~/types/ui.types'
import type { Task, TaskTag, TaskType } from '~/types/task.types'

export type TaskView = 'active' | 'all' | 'completed'

export function useTaskFilters() {
  const tasksStore = useTasksStore()
  const tagsStore = useTagsStore()

  const taskSearch = ref('')
  const selectedTagId = ref('all')
  const taskView = ref<TaskView>('active')

  const isTasksEmpty = computed(() => tasksStore.tasks.length === 0)
  const showActiveSections = computed(() => taskView.value !== 'completed')
  const showCompletedSection = computed(() => taskView.value !== 'active')
  const tagOptions = computed<AppSelectOption[]>(() => {
    const options = new Map<string, AppSelectOption>()

    tasksStore.tasks.forEach((task) => {
      getTaskTags(task).forEach((tag) => {
        const key = getTagFilterKey(tag)
        if (!options.has(key)) {
          options.set(key, {
            label: tag.name,
            value: key,
            color: tag.color,
          })
        }
      })
    })

    return [{ label: 'Все теги', value: 'all' }, ...options.values()]
  })

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

  function getVisibleTasksByType(type: TaskType): Task[] {
    return tasksStore.getTasksByType(type).filter((task) => matchesTaskFilters(task))
  }

  function matchesTaskFilters(task: Task): boolean {
    if (
      selectedTagId.value !== 'all' &&
      !getTaskTags(task).some((tag) => getTagFilterKey(tag) === selectedTagId.value)
    ) {
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

  function getTaskTags(task: Task): TaskTag[] {
    if (task.tags?.length) return task.tags
    return tagsStore.getTagsByIds(task.tagIds)
  }

  function getTagFilterKey(tag: Pick<TaskTag, 'branchId' | 'name'>): string {
    return `${tag.branchId}:${tag.name.trim().toLowerCase()}`
  }

  return {
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
  }
}
