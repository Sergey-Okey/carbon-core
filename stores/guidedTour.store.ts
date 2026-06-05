import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type GuidedTourStep = {
  id: string
  target?: string
  title: string
  text: string
  action?: string
}

const STEPS: GuidedTourStep[] = [
  {
    id: 'tasks',
    target: 'nav-tasks',
    title: 'Первый шаг',
    text: 'Откройте раздел задач. Здесь пользователь собирает дневной, недельный и долгий фокус.',
    action: 'nav:tasks',
  },
  {
    id: 'task-add',
    target: 'task-add-day',
    title: 'Создайте задачу',
    text: 'Нажмите плюс в блоке задач на день. Обучение продолжится после открытия формы.',
    action: 'task-form-open',
  },
  {
    id: 'task-save',
    target: 'task-save',
    title: 'Заполните задачу',
    text: 'Введите короткое название и сохраните. Так пользователь сразу получает первый рабочий объект.',
    action: 'task-created',
  },
  {
    id: 'board',
    target: 'nav-board',
    title: 'Перейдите на доску',
    text: 'Доска связывает задачи, этапы и ветки в понятную карту движения.',
    action: 'nav:board',
  },
  {
    id: 'branch-add',
    target: 'board-add-branch',
    title: 'Добавьте ветку',
    text: 'Нажмите создание ветки. Это основной контейнер для направления, проекта или цели.',
    action: 'branch-modal-open',
  },
  {
    id: 'branch-save',
    target: 'branch-save',
    title: 'Сохраните ветку',
    text: 'Задайте название и сохраните ветку. После этого можно добавлять этапы и связи.',
    action: 'branch-created',
  },
  {
    id: 'focus',
    target: 'nav-shop',
    title: 'Откройте фокус',
    text: 'Фокус помогает превратить задачи в рабочие сессии, а не просто список.',
    action: 'nav:shop',
  },
  {
    id: 'focus-start',
    target: 'focus-start',
    title: 'Запустите таймер',
    text: 'Стартуйте короткую сессию. Счетчик дня сохранит завершенные подходы.',
    action: 'focus-started',
  },
  {
    id: 'complete',
    title: 'Обучение пройдено',
    text: 'Готово. Пользователь увидел базовый путь: задача, доска, ветка и фокус.',
  },
]

export const useGuidedTourStore = defineStore(
  'guided-tour',
  () => {
    const isActive = ref(false)
    const isCompleted = ref(false)
    const currentStepIndex = ref(0)

    const steps = computed(() => STEPS)
    const currentStep = computed(() => steps.value[currentStepIndex.value] || steps.value[0])
    const isFinishStep = computed(() => currentStep.value?.id === 'complete')

    function start(force = false) {
      if (isCompleted.value && !force) return
      currentStepIndex.value = 0
      isActive.value = true
      isCompleted.value = false
    }

    function startIfNeeded() {
      if (!isCompleted.value && !isActive.value) start()
    }

    function skip() {
      isActive.value = false
      isCompleted.value = true
    }

    function finish() {
      isActive.value = false
      isCompleted.value = true
      currentStepIndex.value = steps.value.length - 1
    }

    function next() {
      if (currentStepIndex.value >= steps.value.length - 1) {
        finish()
        return
      }

      currentStepIndex.value += 1
    }

    function handleAction(action: string) {
      if (!isActive.value || isCompleted.value) return
      if (currentStep.value?.action !== action) return
      next()
    }

    return {
      isActive,
      isCompleted,
      currentStepIndex,
      steps,
      currentStep,
      isFinishStep,
      start,
      startIfNeeded,
      skip,
      finish,
      next,
      handleAction,
    }
  },
  {
    persist: import.meta.client
      ? { key: 'carbon-guided-tour', storage: localStorage }
      : undefined,
  }
)
