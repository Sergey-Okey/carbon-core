import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

export type GuidedTourStep = {
  id: string
  target?: string
  title: string
  text: string
  action?: string
  hint?: string
  optional?: boolean
  recoveryText?: string
  requiredCount?: number
}

const STEPS: GuidedTourStep[] = [
  {
    id: 'tasks',
    target: 'nav-tasks',
    title: 'Сначала соберите задачи',
    text: 'Откройте раздел задач. Здесь начинается работа: короткие задачи на день и привычки, которые повторяются.',
    action: 'nav:tasks',
    hint: 'Нажмите иконку задач в навигации.',
  },
  {
    id: 'task-add',
    target: 'task-add-day',
    title: 'Создайте задачу на сегодня',
    text: 'Нажмите плюс в блоке “Сегодня” и добавьте одну простую задачу. Например: “Разобрать почту”.',
    action: 'task-form-open',
    hint: 'Обучение подождет, пока откроется форма.',
  },
  {
    id: 'task-save',
    target: 'task-save',
    title: 'Сохраните задачу',
    text: 'Введите название и сохраните. Описание, дату и теги можно оставить пустыми.',
    action: 'task-created',
    recoveryText: 'Если форма закрылась, вернитесь назад и снова нажмите плюс в блоке “Сегодня”.',
  },
  {
    id: 'habit-add',
    target: 'habit-add',
    title: 'Добавьте привычку',
    text: 'Теперь создайте привычку. Это действие, которое можно отмечать каждый день.',
    action: 'habit-form-open',
    hint: 'Нажмите плюс в блоке “Привычки”.',
  },
  {
    id: 'habit-save',
    target: 'task-save',
    title: 'Сохраните привычку',
    text: 'Назовите привычку коротко: “Вода”, “Чтение”, “Тренировка”.',
    action: 'habit-created',
    recoveryText: 'Если форма закрылась, вернитесь назад и снова нажмите плюс в блоке “Привычки”.',
  },
  {
    id: 'second-task-add',
    target: 'task-add-day',
    title: 'Добавьте еще одну задачу',
    text: 'Для первого ритма лучше иметь пару маленьких задач. Добавьте вторую задачу на сегодня.',
    action: 'task-form-open',
    hint: 'Пусть это будет что-то быстрое и понятное.',
  },
  {
    id: 'second-task-save',
    target: 'task-save',
    title: 'Сохраните вторую задачу',
    text: 'Введите название и сохраните. Теперь можно увидеть, как работает выполнение.',
    action: 'task-created',
    recoveryText: 'Если форма закрылась, вернитесь назад и снова нажмите плюс в блоке “Сегодня”.',
  },
  {
    id: 'complete-tasks',
    target: 'task-complete',
    title: 'Выполните пару задач',
    text: 'Отметьте выполненными две обычные задачи. Так аналитика и доска начнут показывать реальное движение.',
    action: 'task-completed',
    requiredCount: 2,
    hint: 'Можно выполнить задачи из любого периода, кроме привычек.',
    recoveryText: 'Если кнопки выполнения не видно, добавьте еще одну задачу на сегодня или прокрутите список активных задач.',
  },
  {
    id: 'board',
    target: 'nav-board',
    title: 'Теперь посмотрите доску',
    text: 'Доска нужна, чтобы увидеть направления, этапы и связи между ними, а не держать все в голове.',
    action: 'nav:board',
  },
  {
    id: 'branches',
    target: 'board-add-branch',
    title: 'Ветки - это направления',
    text: 'Ветка может быть проектом, целью или областью жизни. Здесь вы собираете крупные направления.',
    optional: true,
    hint: 'Создавать ветку сейчас не обязательно. Просто посмотрите, где находится действие.',
  },
  {
    id: 'milestones',
    target: 'board-add-milestone',
    title: 'Этапы - это следующие шаги',
    text: 'Этапы добавляются к выбранной ветке и помогают разложить направление на понятные части.',
    optional: true,
    hint: 'Если кнопка неактивна, это нормально: сначала нужно выбрать ветку.',
  },
  {
    id: 'analytics',
    target: 'nav-analytics',
    title: 'Проверьте аналитику',
    text: 'Аналитика показывает темп, выполненные задачи и лучшие часы работы. Она становится полезнее после действий.',
    action: 'nav:analytics',
  },
  {
    id: 'analytics-view',
    target: 'analytics-page',
    title: 'Здесь виден прогресс',
    text: 'Смотрите не на красивые цифры, а на ритм: когда вы чаще завершаете задачи и где проседает фокус.',
    optional: true,
  },
  {
    id: 'focus',
    target: 'nav-shop',
    title: 'Фокус - для рабочих сессий',
    text: 'Фокус не обязателен для старта. Это отдельная страница, где можно включить таймер, когда задача уже выбрана.',
    action: 'nav:shop',
  },
  {
    id: 'focus-view',
    target: 'focus-page',
    title: 'Таймер помогает начать',
    text: 'Выберите режим и работайте короткими сессиями. Завершенные подходы сохраняются в блоке “Сегодня”.',
    optional: true,
  },
  {
    id: 'complete',
    title: 'Готово',
    text: 'Основной путь пройден: задача, привычка, выполнение, доска, аналитика и фокус.',
  },
]

export const useGuidedTourStore = defineStore('guided-tour', () => {
    const storageKey = 'cof-guided-tour-progress'
    const isActive = ref(false)
    const isCompleted = ref(false)
    const hasStarted = ref(false)
    const currentStepIndex = ref(0)
    const actionProgress = ref<Record<string, number>>({})
    const isHydrated = ref(false)

    const steps = computed(() => STEPS)
    const currentStep = computed(() => steps.value[currentStepIndex.value] || steps.value[0])
    const isFinishStep = computed(() => currentStep.value?.id === 'complete')
    const canGoBack = computed(() => currentStepIndex.value > 0)
    const currentProgress = computed(() => actionProgress.value[currentStep.value.id] || 0)
    const currentRequired = computed(() => currentStep.value.requiredCount || 0)
    const hasProgress = computed(() => currentRequired.value > 0)

    function start(force = false) {
      if (force || isCompleted.value) {
        currentStepIndex.value = 0
        actionProgress.value = {}
      }
      hasStarted.value = true
      isActive.value = true
      isCompleted.value = false
    }

    function pause() {
      isActive.value = false
    }

    function skip() {
      pause()
    }

    function finish() {
      isActive.value = false
      isCompleted.value = true
      hasStarted.value = false
      currentStepIndex.value = steps.value.length - 1
    }

    function next() {
      if (currentStepIndex.value >= steps.value.length - 1) {
        finish()
        return
      }

      currentStepIndex.value += 1
    }

    function back() {
      if (currentStepIndex.value === 0) return
      currentStepIndex.value -= 1
    }

    function handleAction(action: string) {

      if (!hasStarted.value || isCompleted.value) return
      const step = currentStep.value
      if (step.action !== action) return

      if (step.requiredCount && step.requiredCount > 1) {
        const nextProgress = Math.min((actionProgress.value[step.id] || 0) + 1, step.requiredCount)
        actionProgress.value = {
          ...actionProgress.value,
          [step.id]: nextProgress,
        }
        if (nextProgress < step.requiredCount) return
      }

      next()
    }

    function hydrate() {
      if (!import.meta.client || isHydrated.value) return
      isHydrated.value = true

      try {
        const raw = localStorage.getItem(storageKey)
        if (!raw) return
        const saved = JSON.parse(raw) as {
          isActive?: boolean
          isCompleted?: boolean
          hasStarted?: boolean
          currentStepIndex?: number
          actionProgress?: Record<string, number>
        }

        currentStepIndex.value = Math.min(
          Math.max(0, Number(saved.currentStepIndex) || 0),
          steps.value.length - 1
        )
        actionProgress.value =
          saved.actionProgress && typeof saved.actionProgress === 'object'
            ? saved.actionProgress
            : {}
        isCompleted.value = saved.isCompleted === true
        hasStarted.value = saved.hasStarted === true || saved.isActive === true
        isActive.value = saved.isActive === true && !isCompleted.value
      } catch {
        localStorage.removeItem(storageKey)
      }
    }

    if (import.meta.client) {
      hydrate()
      watch(
        [isActive, isCompleted, hasStarted, currentStepIndex, actionProgress],
        () => {
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              isActive: isActive.value,
              isCompleted: isCompleted.value,
              hasStarted: hasStarted.value,
              currentStepIndex: currentStepIndex.value,
              actionProgress: actionProgress.value,
            })
          )
        },
        { deep: true }
      )
    }

  return {
    isActive,
    isCompleted,
    hasStarted,
    currentStepIndex,
    actionProgress,
    steps,
    currentStep,
    isFinishStep,
    canGoBack,
    currentProgress,
    currentRequired,
    hasProgress,
    start,
    pause,
    skip,
    finish,
    next,
    back,
    handleAction,
    hydrate,
  }
})
