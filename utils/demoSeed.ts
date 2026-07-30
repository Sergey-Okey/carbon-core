import type { Edge } from '@vue-flow/core'
import type { Branch, Milestone } from '~/types/branch.types'
import type { Task, TaskType } from '~/types/task.types'
import { useAccessStore } from '~/stores/access.store'
import { useBranchesStore } from '~/stores/branches.store'
import { useTagsStore } from '~/stores/tags.store'
import { useTasksStore } from '~/stores/tasks.store'
import { useUserStore } from '~/stores/user.store'
import { accessAwareStorage } from '~/utils/accessStorage'

const DEMO_SEED_KEY = 'carbon-demo-workspace-seeded-v8'
const edgeStyle = { stroke: 'var(--dim)', strokeWidth: 1.15 }
const DEMO_BRANCH_IDS = ['COF', 'BODY', 'MIND', 'FIN'] as const

function dateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function daysAgo(offset: number): Date {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() - offset)
  return date
}

function atHour(base: Date, hour: number, minute = 0): number {
  const date = new Date(base)
  date.setHours(hour, minute, 0, 0)
  return date.getTime()
}

/** ~30 days of work: weekday push, weekend dips, mid-month sprint. */
function buildActivityHistory(): { date: string; count: number }[] {
  const pattern = [
    // weeks ago → today (30 days)
    2, 5, 7, 6, 8, 3, 1, // week −4
    4, 6, 9, 7, 8, 2, 0, // week −3
    5, 8, 10, 9, 11, 4, 2, // week −2 (sprint)
    3, 7, 8, 6, 9, 5, 1, // week −1
    6, 8, // this week so far
  ]
  return pattern.map((count, index) => {
    const offset = pattern.length - 1 - index
    return { date: dateKey(daysAgo(offset)), count }
  })
}

/** Spread daily counts into timed events so hour chart matches history. */
function buildCompletionLogFromHistory(
  history: { date: string; count: number }[],
  taskPool: { id: string; title: string; type: TaskType }[]
) {
  const hours = [7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22]
  const entries: {
    id: string
    at: number
    taskId: string
    type: TaskType
    title: string
  }[] = []

  history.forEach((day, dayIndex) => {
    for (let i = 0; i < day.count; i += 1) {
      const seed = taskPool[(dayIndex * 3 + i * 2) % Math.max(taskPool.length, 1)]
      if (!seed) continue
      const hour = hours[(dayIndex + i * 3) % hours.length]
      const base = new Date(`${day.date}T00:00:00`)
      entries.push({
        id: `demo-log-${day.date}-${i}`,
        at: atHour(base, hour, (i * 11 + dayIndex * 3) % 60),
        taskId: seed.id,
        type: seed.type,
        title: seed.title,
      })
    }
  })

  return entries
}

function milestone(
  id: string,
  name: string,
  status: Milestone['status'],
  position: { x: number; y: number },
  icon = 'target',
  description = ''
): Milestone {
  return {
    id,
    name,
    icon,
    description,
    status,
    taskIds: [],
    position,
    achieved: status === 'completed',
  }
}

function buildDemoBranches(): Branch[] {
  return [
    {
      id: 'COF',
      displayName: 'Core of Life',
      icon: 'target',
      description: 'Продукт: от идеи до публичного релиза',
      markerColor: '#d6d6d6',
      taskIds: [],
      milestones: [
        milestone('cof-m1', 'Видение продукта', 'completed', { x: 300, y: 360 }, 'target', 'Цель и позиционирование'),
        milestone('cof-m2', 'Исследование', 'completed', { x: 620, y: 40 }, 'compass', 'Интервью и референсы'),
        milestone('cof-m3', 'Бренд', 'completed', { x: 620, y: 240 }, 'lightbulb', 'Тон, лого, палитра'),
        milestone('cof-m4', 'Продуктовый план', 'completed', { x: 620, y: 440 }, 'map', 'Roadmap и приоритеты'),
        milestone('cof-m5', 'Рынок', 'completed', { x: 620, y: 640 }, 'users', 'Аудитория и позиционирование'),
        milestone('cof-m6', 'Дизайн-система', 'completed', { x: 940, y: -60 }, 'folder-kanban', 'Компоненты и токены'),
        milestone('cof-m7', 'UX-потоки', 'completed', { x: 940, y: 80 }, 'map', 'Онбординг и сценарии'),
        milestone('cof-m8', 'Контент', 'active', { x: 940, y: 220 }, 'book-open', 'Тексты и онбординг'),
        milestone('cof-m9', 'Архитектура', 'completed', { x: 940, y: 360 }, 'briefcase', 'Сторы, sync, доступ'),
        milestone('cof-m10', 'API-контракт', 'active', { x: 940, y: 500 }, 'code', 'Эндпоинты и модели'),
        milestone('cof-m11', 'Frontend ядро', 'completed', { x: 940, y: 640 }, 'code', 'Vue 3 + Nuxt экраны'),
        milestone('cof-m12', 'Backend', 'active', { x: 940, y: 780 }, 'briefcase', 'Auth, данные, правила'),
        milestone('cof-m13', 'Аналитика', 'active', { x: 940, y: 920 }, 'trending-up', 'Метрики и виджеты'),
        milestone('cof-m14', 'Лендинг', 'pending', { x: 940, y: 1060 }, 'flag', 'Публичная страница'),
        milestone('cof-m15', 'Бета-круг', 'pending', { x: 940, y: 1200 }, 'rocket', 'Закрытый круг пользователей'),
        milestone('cof-m16', 'Компоненты UI', 'completed', { x: 1260, y: -60 }, 'folder-kanban', 'Карточки и формы'),
        milestone('cof-m17', 'Прототипы', 'active', { x: 1260, y: 80 }, 'compass', 'Кликнутые сценарии'),
        milestone('cof-m18', 'Интеграция FE', 'pending', { x: 1260, y: 640 }, 'code', 'Склейка экранов'),
        milestone('cof-m19', 'Интеграция BE', 'pending', { x: 1260, y: 780 }, 'briefcase', 'API в прод'),
        milestone('cof-m20', 'Релиз 1.0', 'pending', { x: 1580, y: 640 }, 'flag', 'Публичный запуск'),
      ],
      order: 0,
      position: { x: 40, y: 360 },
    },
    {
      id: 'BODY',
      displayName: 'Тело',
      icon: 'heart',
      description: 'Энергия, сон, движение и восстановление',
      markerColor: '#4caf7f',
      taskIds: [],
      milestones: [
        milestone('body-m1', 'Базовый чекап', 'completed', { x: 300, y: 1680 }, 'heart', 'Стартовые метрики'),
        milestone('body-m2', 'Сон', 'completed', { x: 620, y: 1400 }, 'home', 'Режим и качество'),
        milestone('body-m3', 'Сила', 'active', { x: 620, y: 1600 }, 'dumbbell', 'Силовые тренировки'),
        milestone('body-m4', 'Кардио', 'completed', { x: 620, y: 1800 }, 'trending-up', 'Зона 2 / интервалы'),
        milestone('body-m5', 'Питание', 'active', { x: 620, y: 2000 }, 'award', 'Белок и режим еды'),
        milestone('body-m6', 'Сон-скоринг', 'completed', { x: 940, y: 1320 }, 'calendar-days', 'Трекинг качества сна'),
        milestone('body-m7', 'Ритуал отхода', 'active', { x: 940, y: 1480 }, 'home', 'Экран / свет / время'),
        milestone('body-m8', 'Верх тела', 'active', { x: 940, y: 1600 }, 'dumbbell', 'Жим / тяга'),
        milestone('body-m9', 'Низ тела', 'pending', { x: 940, y: 1720 }, 'dumbbell', 'Присед / выпады'),
        milestone('body-m10', 'Зона 2', 'completed', { x: 940, y: 1800 }, 'plane', 'Длинные сессии'),
        milestone('body-m11', 'Интервалы', 'pending', { x: 940, y: 1920 }, 'trending-up', 'Короткие серии'),
        milestone('body-m12', 'Гидратация', 'active', { x: 940, y: 2000 }, 'compass', '2л воды в день'),
        milestone('body-m13', 'Список покупок', 'pending', { x: 940, y: 2120 }, 'folder-kanban', 'Базовые продукты'),
        milestone('body-m14', 'Восстановление', 'pending', { x: 1260, y: 1600 }, 'heart', 'Мобилити и отдых'),
        milestone('body-m15', 'Пиковая форма', 'pending', { x: 1260, y: 2000 }, 'trophy', 'Устойчивый уровень энергии'),
      ],
      order: 1,
      position: { x: 40, y: 1680 },
    },
    {
      id: 'MIND',
      displayName: 'Разум',
      icon: 'brain',
      description: 'Фокус, обучение и система знаний',
      markerColor: '#f59e0b',
      taskIds: [],
      milestones: [
        milestone('mind-m1', 'Утренний обзор', 'completed', { x: 300, y: 2620 }, 'lightbulb', 'План дня на 10 мин'),
        milestone('mind-m2', 'Глубокая работа', 'completed', { x: 620, y: 2420 }, 'target', 'Блоки без отвлечений'),
        milestone('mind-m3', 'Обучение', 'active', { x: 620, y: 2620 }, 'graduation-cap', 'Курс / навык'),
        milestone('mind-m4', 'Рефлексия', 'completed', { x: 620, y: 2820 }, 'brain', 'Вечерний обзор'),
        milestone('mind-m5', 'Стрик фокуса', 'active', { x: 940, y: 2300 }, 'trophy', 'Серия продуктивных дней'),
        milestone('mind-m6', 'Контроль отвлечений', 'completed', { x: 940, y: 2460 }, 'flag', 'Без соцсетей до обеда'),
        milestone('mind-m7', 'Трекинг сессий', 'completed', { x: 940, y: 2620 }, 'calendar-days', 'Помодоро / таймер'),
        milestone('mind-m8', 'Чтение', 'active', { x: 940, y: 2780 }, 'book-open', 'Регулярный ритм книг'),
        milestone('mind-m9', 'Заметки', 'pending', { x: 940, y: 2940 }, 'folder-kanban', 'Второй мозг'),
        milestone('mind-m10', 'Практика', 'pending', { x: 940, y: 3100 }, 'code', 'Применение навыка'),
        milestone('mind-m11', 'Недельный обзор', 'pending', { x: 1260, y: 2300 }, 'calendar-days', 'Итоги фокуса'),
        milestone('mind-m12', 'Система знаний', 'pending', { x: 1260, y: 2940 }, 'brain', 'Связанные заметки'),
      ],
      order: 2,
      position: { x: 40, y: 2620 },
    },
    {
      id: 'FIN',
      displayName: 'Финансы',
      icon: 'wallet-cards',
      description: 'Учёт, подушка и рост капитала',
      markerColor: '#ffd700',
      taskIds: [],
      milestones: [
        milestone('fin-m1', 'Учёт расходов', 'completed', { x: 300, y: 3480 }, 'wallet-cards', 'Все траты в одном месте'),
        milestone('fin-m2', 'Бюджет месяца', 'completed', { x: 620, y: 3280 }, 'folder-kanban', 'Лимиты по категориям'),
        milestone('fin-m3', 'Аудит подписок', 'completed', { x: 620, y: 3480 }, 'award', 'Отсечь лишнее'),
        milestone('fin-m4', 'План долгов', 'active', { x: 620, y: 3680 }, 'briefcase', 'График выплат'),
        milestone('fin-m5', 'Подушка 1 мес', 'active', { x: 940, y: 3180 }, 'home', 'Резерв на месяц'),
        milestone('fin-m6', 'Автонакопления', 'pending', { x: 940, y: 3340 }, 'calendar-days', 'Перевод в день зарплаты'),
        milestone('fin-m7', 'Категории трат', 'completed', { x: 940, y: 3500 }, 'folder-kanban', 'Еда / дом / сервис'),
        milestone('fin-m8', 'Отмена лишнего', 'active', { x: 940, y: 3660 }, 'flag', 'Подписки под нож'),
        milestone('fin-m9', 'Первый платёж', 'pending', { x: 940, y: 3820 }, 'trending-up', 'Старт графика'),
        milestone('fin-m10', 'Старт инвестиций', 'pending', { x: 1260, y: 3180 }, 'trending-up', 'Первый портфель'),
        milestone('fin-m11', 'Квартальный обзор', 'pending', { x: 1260, y: 3500 }, 'flag', 'Ревью целей и рисков'),
      ],
      order: 3,
      position: { x: 40, y: 3480 },
    },
  ]
}

function buildDemoEdges(): Edge[] {
  const links: Array<[string, string]> = [
    // COF
    ['COF', 'cof-m1'],
    ['cof-m1', 'cof-m2'],
    ['cof-m1', 'cof-m3'],
    ['cof-m1', 'cof-m4'],
    ['cof-m1', 'cof-m5'],
    ['cof-m2', 'cof-m6'],
    ['cof-m2', 'cof-m7'],
    ['cof-m2', 'cof-m8'],
    ['cof-m3', 'cof-m9'],
    ['cof-m3', 'cof-m10'],
    ['cof-m4', 'cof-m11'],
    ['cof-m4', 'cof-m12'],
    ['cof-m4', 'cof-m13'],
    ['cof-m5', 'cof-m14'],
    ['cof-m5', 'cof-m15'],
    ['cof-m6', 'cof-m16'],
    ['cof-m7', 'cof-m17'],
    ['cof-m11', 'cof-m18'],
    ['cof-m12', 'cof-m19'],
    ['cof-m18', 'cof-m20'],
    // BODY
    ['BODY', 'body-m1'],
    ['body-m1', 'body-m2'],
    ['body-m1', 'body-m3'],
    ['body-m1', 'body-m4'],
    ['body-m1', 'body-m5'],
    ['body-m2', 'body-m6'],
    ['body-m2', 'body-m7'],
    ['body-m3', 'body-m8'],
    ['body-m3', 'body-m9'],
    ['body-m4', 'body-m10'],
    ['body-m4', 'body-m11'],
    ['body-m5', 'body-m12'],
    ['body-m5', 'body-m13'],
    ['body-m8', 'body-m14'],
    ['body-m12', 'body-m15'],
    // MIND
    ['MIND', 'mind-m1'],
    ['mind-m1', 'mind-m2'],
    ['mind-m1', 'mind-m3'],
    ['mind-m1', 'mind-m4'],
    ['mind-m2', 'mind-m5'],
    ['mind-m2', 'mind-m6'],
    ['mind-m2', 'mind-m7'],
    ['mind-m3', 'mind-m8'],
    ['mind-m3', 'mind-m9'],
    ['mind-m3', 'mind-m10'],
    ['mind-m5', 'mind-m11'],
    ['mind-m9', 'mind-m12'],
    // FIN
    ['FIN', 'fin-m1'],
    ['fin-m1', 'fin-m2'],
    ['fin-m1', 'fin-m3'],
    ['fin-m1', 'fin-m4'],
    ['fin-m2', 'fin-m5'],
    ['fin-m2', 'fin-m6'],
    ['fin-m2', 'fin-m7'],
    ['fin-m3', 'fin-m8'],
    ['fin-m4', 'fin-m9'],
    ['fin-m5', 'fin-m10'],
    ['fin-m7', 'fin-m11'],
  ]

  return links.map(([source, target], index) => ({
    id: `demo-edge-${index}`,
    source,
    target,
    sourceHandle: `source-right-${source}`,
    targetHandle: `target-left-${target}`,
    type: 'smoothstep',
    pathOptions: { borderRadius: 16, offset: 10 },
    animated: false,
    style: edgeStyle,
  }))
}

function ensureDemoBoardEdges() {
  const branchesStore = useBranchesStore()
  const hasDemoBranches = DEMO_BRANCH_IDS.every((id) =>
    branchesStore.branches.some((branch) => branch.id === id)
  )
  if (!hasDemoBranches) return

  const connectedRoots = new Set(
    branchesStore.edges
      .filter((edge) => DEMO_BRANCH_IDS.includes(edge.source as (typeof DEMO_BRANCH_IDS)[number]))
      .map((edge) => edge.source)
  )
  const missing = DEMO_BRANCH_IDS.some((id) => !connectedRoots.has(id))
  if (!missing) return

  branchesStore.replaceEdges(buildDemoEdges())
}

/** Keep demo branch colors + milestone progress visible for analytics arcs. */
function ensureDemoProgressArcs() {
  const branchesStore = useBranchesStore()
  const seeded = buildDemoBranches()
  const seedById = new Map(seeded.map((branch) => [branch.id, branch]))

  const missingBranches = seeded.filter(
    (seed) => !branchesStore.branches.some((branch) => branch.id === seed.id)
  )
  if (missingBranches.length) {
    branchesStore.$patch({
      branches: [...branchesStore.branches, ...missingBranches],
    })
    branchesStore.replaceEdges(buildDemoEdges())
    return
  }

  let changed = false
  const next = branchesStore.branches.map((branch) => {
    const seed = seedById.get(branch.id)
    if (!seed) return branch

    const seedStatuses = new Map(seed.milestones.map((item) => [item.id, item.status]))
    const hasCompleted = (branch.milestones ?? []).some((item) => item.status === 'completed')
    let branchChanged = false

    const milestones = (branch.milestones ?? []).map((item) => {
      const seedStatus = seedStatuses.get(item.id)
      if (!hasCompleted && seedStatus && item.status !== seedStatus) {
        branchChanged = true
        return {
          ...item,
          status: seedStatus,
          achieved: seedStatus === 'completed',
        }
      }
      return item
    })

    const markerColor =
      seed.markerColor && branch.markerColor !== seed.markerColor
        ? seed.markerColor
        : branch.markerColor

    if (markerColor !== branch.markerColor) branchChanged = true
    if (!branchChanged) return branch

    changed = true
    return { ...branch, markerColor, milestones }
  })

  if (changed) {
    branchesStore.$patch({ branches: next })
  }
}

type SeedTask = {
  id: string
  title: string
  description?: string
  type: TaskType
  tagIds: string[]
  done?: boolean
  completedAt?: number
  lastCompletedAt?: number
  createdAt: number
}

function buildDemoTasks(tagIds: {
  focus: string
  health: string
  work: string
  learn: string
  money: string
}): SeedTask[] {
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const d = (offset: number) => daysAgo(offset)

  const habits: SeedTask[] = [
    {
      id: 'demo-habit-1',
      title: 'Утренняя зарядка',
      description: '10–15 минут мобилити и суставной разминки',
      type: 'HABIT',
      tagIds: [tagIds.health],
      lastCompletedAt: atHour(today, 7, 20),
      createdAt: atHour(d(45), 9),
    },
    {
      id: 'demo-habit-2',
      title: 'Медитация 10 мин',
      type: 'HABIT',
      tagIds: [tagIds.focus],
      lastCompletedAt: atHour(today, 8, 5),
      createdAt: atHour(d(40), 9),
    },
    {
      id: 'demo-habit-3',
      title: 'Чтение 20 стр',
      type: 'HABIT',
      tagIds: [tagIds.learn],
      lastCompletedAt: atHour(d(1), 21, 10),
      createdAt: atHour(d(38), 9),
    },
    {
      id: 'demo-habit-4',
      title: 'Вода 2л',
      type: 'HABIT',
      tagIds: [tagIds.health],
      lastCompletedAt: atHour(today, 18, 40),
      createdAt: atHour(d(35), 9),
    },
    {
      id: 'demo-habit-5',
      title: 'Без соцсетей до обеда',
      type: 'HABIT',
      tagIds: [tagIds.focus, tagIds.work],
      lastCompletedAt: atHour(today, 12, 5),
      createdAt: atHour(d(28), 9),
    },
    {
      id: 'demo-habit-6',
      title: 'Вечерний обзор дня',
      type: 'HABIT',
      tagIds: [tagIds.focus],
      lastCompletedAt: atHour(d(1), 22, 15),
      createdAt: atHour(d(30), 9),
    },
    {
      id: 'demo-habit-7',
      title: 'Записать 3 благодарности',
      type: 'HABIT',
      tagIds: [tagIds.focus],
      lastCompletedAt: atHour(d(2), 22, 40),
      createdAt: atHour(d(22), 9),
    },
    {
      id: 'demo-habit-8',
      title: 'Прогулка 6k шагов',
      type: 'HABIT',
      tagIds: [tagIds.health],
      lastCompletedAt: atHour(today, 19, 10),
      createdAt: atHour(d(25), 9),
    },
    {
      id: 'demo-habit-9',
      title: 'Учёт расходов дня',
      type: 'HABIT',
      tagIds: [tagIds.money],
      lastCompletedAt: atHour(d(1), 20, 30),
      createdAt: atHour(d(32), 9),
    },
  ]

  const openTasks: SeedTask[] = [
    {
      id: 'demo-day-open-1',
      title: 'Спланировать спринт',
      description: 'Цели недели и приоритеты по Core of Life',
      type: 'TASK_DAY',
      tagIds: [tagIds.work, tagIds.focus],
      createdAt: atHour(today, 8),
    },
    {
      id: 'demo-day-open-2',
      title: 'Дописать виджет аналитики',
      type: 'TASK_DAY',
      tagIds: [tagIds.work],
      createdAt: atHour(today, 9, 15),
    },
    {
      id: 'demo-day-open-3',
      title: 'Созвон по API',
      type: 'TASK_DAY',
      tagIds: [tagIds.work],
      createdAt: atHour(today, 10),
    },
    {
      id: 'demo-week-open-1',
      title: 'Глубокая работа 5 блоков',
      type: 'TASK_WEEK',
      tagIds: [tagIds.focus, tagIds.work],
      createdAt: atHour(d(3), 9),
    },
    {
      id: 'demo-week-open-2',
      title: 'Силовые 3 тренировки',
      type: 'TASK_WEEK',
      tagIds: [tagIds.health],
      createdAt: atHour(d(2), 9),
    },
    {
      id: 'demo-week-open-3',
      title: 'Закрыть бюджет недели',
      type: 'TASK_WEEK',
      tagIds: [tagIds.money],
      createdAt: atHour(d(1), 9),
    },
    {
      id: 'demo-month-open-1',
      title: 'Улучшить сон до 7.5ч',
      type: 'TASK_MONTH',
      tagIds: [tagIds.health],
      createdAt: atHour(d(20), 9),
    },
    {
      id: 'demo-month-open-2',
      title: 'Собрать подушку 1 месяц',
      type: 'TASK_MONTH',
      tagIds: [tagIds.money],
      createdAt: atHour(d(18), 9),
    },
    {
      id: 'demo-month-open-3',
      title: 'Прочитать 2 книги',
      type: 'TASK_MONTH',
      tagIds: [tagIds.learn],
      createdAt: atHour(d(15), 9),
    },
    {
      id: 'demo-year-1',
      title: 'Запустить публичную бету',
      type: 'TASK_YEAR',
      tagIds: [tagIds.work],
      createdAt: atHour(d(60), 9),
    },
    {
      id: 'demo-year-2',
      title: 'Прочитать 24 книги',
      type: 'TASK_YEAR',
      tagIds: [tagIds.learn],
      createdAt: atHour(d(90), 9),
    },
    {
      id: 'demo-year-3',
      title: 'Выйти на пиковую форму',
      type: 'TASK_YEAR',
      tagIds: [tagIds.health],
      createdAt: atHour(d(70), 9),
    },
  ]

  // Completed day/week/month work spread across ~30 days
  const completedDayTitles = [
    ['Закрыть релиз аналитики', [tagIds.work, tagIds.focus]],
    ['Созвон с командой', [tagIds.work]],
    ['Ответить на письма', [tagIds.work]],
    ['Сделать заметки по книге', [tagIds.learn]],
    ['Тренировка ног', [tagIds.health]],
    ['Ревью UI-референсов', [tagIds.work, tagIds.focus]],
    ['Написать acceptance-критерии', [tagIds.work]],
    ['Починить mobile sheet', [tagIds.work]],
    ['Сессия фокуса 2×25', [tagIds.focus]],
    ['Разбор расходов', [tagIds.money]],
    ['Кардио 40 мин', [tagIds.health]],
    ['Обновить онбординг-копию', [tagIds.work, tagIds.learn]],
    ['Собрать FAQ для беты', [tagIds.work]],
    ['Тренировка груди/спины', [tagIds.health]],
    ['Прочитать главу по архитектуре', [tagIds.learn]],
    ['Настроить алерты деплоя', [tagIds.work]],
    ['Вечерняя растяжка', [tagIds.health]],
    ['План контента на неделю', [tagIds.work, tagIds.focus]],
    ['Сверить подписки', [tagIds.money]],
    ['Рефактор TaskToolbar', [tagIds.work]],
    ['Интервальная тренировка', [tagIds.health]],
    ['Конспект лекции', [tagIds.learn]],
    ['Дизайн KPI-карточек', [tagIds.work]],
    ['Закупка продуктов по списку', [tagIds.health, tagIds.money]],
    ['Код-ревью PR аналитики', [tagIds.work]],
    ['Медитация + дневник', [tagIds.focus]],
    ['Прототип ветки Финансы', [tagIds.work]],
    ['Лёгкий бег 5 км', [tagIds.health]],
    ['Обновить демо-сид', [tagIds.work]],
    ['Планирование месяца', [tagIds.focus, tagIds.work]],
  ] as const

  const completedDays: SeedTask[] = completedDayTitles.map(([title, tags], index) => {
    const offset = Math.min(29, Math.floor(index * 0.95) + (index % 3 === 0 ? 0 : index % 2))
    const hour = 9 + ((index * 3) % 12)
    const minute = (index * 13) % 60
    return {
      id: `demo-done-day-${index + 1}`,
      title,
      type: 'TASK_DAY' as const,
      tagIds: [...tags],
      done: true,
      completedAt: atHour(d(offset), hour, minute),
      createdAt: atHour(d(offset + 1), 9),
    }
  })

  const completedWeeks: SeedTask[] = [
    {
      id: 'demo-done-week-1',
      title: 'Пробежать 15 км',
      type: 'TASK_WEEK',
      tagIds: [tagIds.health],
      done: true,
      completedAt: atHour(d(4), 19, 20),
      createdAt: atHour(d(11), 9),
    },
    {
      id: 'demo-done-week-2',
      title: 'Глубокая работа 4 блока',
      type: 'TASK_WEEK',
      tagIds: [tagIds.focus, tagIds.work],
      done: true,
      completedAt: atHour(d(10), 18, 0),
      createdAt: atHour(d(17), 9),
    },
    {
      id: 'demo-done-week-3',
      title: 'Разобрать финансы недели',
      type: 'TASK_WEEK',
      tagIds: [tagIds.money],
      done: true,
      completedAt: atHour(d(6), 20, 45),
      createdAt: atHour(d(13), 9),
    },
    {
      id: 'demo-done-week-4',
      title: 'Закрыть milestone Frontend',
      type: 'TASK_WEEK',
      tagIds: [tagIds.work],
      done: true,
      completedAt: atHour(d(14), 16, 30),
      createdAt: atHour(d(21), 9),
    },
    {
      id: 'demo-done-week-5',
      title: 'Силовые 3× + кардио',
      type: 'TASK_WEEK',
      tagIds: [tagIds.health],
      done: true,
      completedAt: atHour(d(18), 19, 0),
      createdAt: atHour(d(25), 9),
    },
    {
      id: 'demo-done-week-6',
      title: 'Прочитать книгу целиком',
      type: 'TASK_WEEK',
      tagIds: [tagIds.learn],
      done: true,
      completedAt: atHour(d(22), 21, 40),
      createdAt: atHour(d(29), 9),
    },
  ]

  const completedMonths: SeedTask[] = [
    {
      id: 'demo-done-month-1',
      title: 'Закончить онбординг',
      type: 'TASK_MONTH',
      tagIds: [tagIds.work, tagIds.learn],
      done: true,
      completedAt: atHour(d(8), 14, 0),
      createdAt: atHour(d(28), 9),
    },
    {
      id: 'demo-done-month-2',
      title: 'Собрать дизайн-систему v1',
      type: 'TASK_MONTH',
      tagIds: [tagIds.work],
      done: true,
      completedAt: atHour(d(16), 17, 20),
      createdAt: atHour(d(45), 9),
    },
    {
      id: 'demo-done-month-3',
      title: 'Войти в режим сна',
      type: 'TASK_MONTH',
      tagIds: [tagIds.health],
      done: true,
      completedAt: atHour(d(12), 22, 0),
      createdAt: atHour(d(40), 9),
    },
  ]

  return [...habits, ...openTasks, ...completedDays, ...completedWeeks, ...completedMonths]
}

function toTask(
  seed: SeedTask,
  tagsById: Map<string, { id: string; name: string; color?: string; branchId?: string }>
): Task {
  const embedded = seed.tagIds.flatMap((id, order) => {
    const tag = tagsById.get(id)
    if (!tag) return []
    return [
      {
        id: tag.id,
        name: tag.name,
        branchId: tag.branchId || '',
        color: tag.color,
        order,
      },
    ]
  })

  return {
    id: seed.id,
    title: seed.title,
    description: seed.description,
    type: seed.type,
    tagIds: seed.tagIds,
    tags: embedded,
    done: Boolean(seed.done),
    completedAt: seed.completedAt,
    lastCompletedAt: seed.lastCompletedAt,
    createdAt: seed.createdAt,
  }
}

async function waitStoreHydration() {
  const stores = [useTasksStore(), useBranchesStore(), useTagsStore(), useUserStore()]
  await Promise.all(
    stores.map(async (store) => {
      if (store.$persistedState) await store.$persistedState.isReady
    })
  )
}

function applyDemoSeed() {
  const tasksStore = useTasksStore()
  const branchesStore = useBranchesStore()
  const tagsStore = useTagsStore()
  const userStore = useUserStore()

  tagsStore.$patch({ tags: [] })

  const focus = tagsStore.addTag({ name: 'Фокус', color: 'var(--accent)', order: 0, branchId: '' })
  const health = tagsStore.addTag({ name: 'Здоровье', color: 'var(--success)', order: 1, branchId: 'BODY' })
  const work = tagsStore.addTag({ name: 'Работа', color: 'var(--warning)', order: 2, branchId: 'COF' })
  const learn = tagsStore.addTag({ name: 'Учёба', color: 'var(--gold)', order: 3, branchId: 'MIND' })
  const money = tagsStore.addTag({ name: 'Деньги', color: 'var(--bronze)', order: 4, branchId: 'FIN' })

  const tagIds = {
    focus: focus.id,
    health: health.id,
    work: work.id,
    learn: learn.id,
    money: money.id,
  }

  const tagsById = new Map(
    [focus, health, work, learn, money].map((tag) => [tag.id, tag])
  )

  const seededTasks = buildDemoTasks(tagIds).map((item) => toTask(item, tagsById))
  const history = buildActivityHistory()
  const completedCount = history.reduce((sum, day) => sum + day.count, 0)
  const completionLog = buildCompletionLogFromHistory(
    history,
    seededTasks.map((task) => ({ id: task.id, title: task.title, type: task.type }))
  )

  tasksStore.$patch({
    tasks: seededTasks,
    deletedTasks: [],
    completedTasksHistory: history,
    completionLog,
  })

  branchesStore.$patch({
    branches: buildDemoBranches(),
  })
  branchesStore.replaceEdges(buildDemoEdges())

  userStore.$patch({
    leaguePoints: 4820,
    completedTasksCount: Math.max(completedCount, 160),
    profile: {
      name: 'Алекс',
      bio: 'Месяц в ритме Core of Life — продукт, тело, фокус и финансы',
      email: 'demo@coreoflife.app',
      avatar: '',
    },
  })

  tagsStore.normalizeTags(tasksStore.tasks)
}

export async function seedDemoWorkspaceIfNeeded() {
  if (!import.meta.client) return false

  const accessStore = useAccessStore()
  if (!accessStore.isDemo) return false

  await waitStoreHydration()

  if (accessAwareStorage.getItem(DEMO_SEED_KEY) === '1') {
    ensureDemoBoardEdges()
    ensureDemoProgressArcs()
    ensureDemoCompletionLog()
    return false
  }

  applyDemoSeed()
  accessAwareStorage.setItem(DEMO_SEED_KEY, '1')
  return true
}

function ensureDemoCompletionLog() {
  const tasksStore = useTasksStore()
  if (tasksStore.completionLog.length) return
  const history = tasksStore.completedTasksHistory
  if (!history.length) return
  const pool = tasksStore.tasks.map((task) => ({
    id: task.id,
    title: task.title,
    type: task.type,
  }))
  if (!pool.length) return
  tasksStore.replaceCompletionLog(buildCompletionLogFromHistory(history, pool))
}
