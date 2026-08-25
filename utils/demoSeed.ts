import type { Edge } from '@vue-flow/core'
import type { Branch, Milestone } from '~/types/branch.types'
import type { Task, TaskType } from '~/types/task.types'
import { useAccessStore } from '~/stores/access.store'
import { useBranchesStore } from '~/stores/branches.store'
import { useTagsStore } from '~/stores/tags.store'
import { useTasksStore } from '~/stores/tasks.store'
import { useUserStore } from '~/stores/user.store'
import { accessAwareStorage } from '~/utils/accessStorage'

const DEMO_SEED_KEY = 'carbon-demo-workspace-seeded-v11'
const edgeStyle = { stroke: 'var(--dim)', strokeWidth: 1.15 }
const DEMO_BRANCH_IDS = ['COF'] as const
const COL = 340
const ROW = 156

function at(col: number, row: number) {
  return { x: 380 + col * COL, y: 48 + row * ROW }
}

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


function buildActivityHistory(): { date: string; count: number }[] {
  const pattern = [

    2, 5, 7, 6, 8, 3, 1,
    4, 6, 9, 7, 8, 2, 0,
    5, 8, 10, 9, 11, 4, 2,
    3, 7, 8, 6, 9, 5, 1,
    6, 8,
  ]
  return pattern.map((count, index) => {
    const offset = pattern.length - 1 - index
    return { date: dateKey(daysAgo(offset)), count }
  })
}


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
      description: 'Четыре потока от одного корня: продукт, тело, разум и деньги',
      markerColor: '#d6d6d6',
      taskIds: [],
      milestones: [
        milestone('cof-vision', 'Видение', 'completed', at(0, 6), 'target', 'Зачем это всё и какой ритм нужен'),
        milestone('cof-product', 'Продукт', 'completed', at(1, 1), 'map', 'Core of Life как главная ставка'),
        milestone('cof-body', 'Тело', 'completed', at(1, 5), 'heart', 'Энергия для длинной дистанции'),
        milestone('cof-mind', 'Разум', 'completed', at(1, 8), 'brain', 'Фокус, обучение, ясность'),
        milestone('cof-money', 'Деньги', 'completed', at(1, 11), 'wallet-cards', 'Запас и свобода решений'),

        milestone('cof-research', 'Исследование', 'completed', at(2, 0), 'compass', 'Интервью и референсы'),
        milestone('cof-brand', 'Бренд', 'completed', at(2, 1), 'lightbulb', 'Тон, лого, палитра'),
        milestone('cof-plan', 'Продуктовый план', 'completed', at(2, 2), 'map', 'Roadmap и приоритеты'),
        milestone('cof-checkup', 'Базовый чекап', 'completed', at(2, 4), 'heart', 'Стартовые метрики тела'),
        milestone('cof-sleep', 'Сон', 'completed', at(2, 5), 'home', 'Режим и качество восстановления'),
        milestone('cof-strength', 'Сила', 'active', at(2, 6), 'dumbbell', 'Силовые как опора энергии'),
        milestone('cof-review', 'Утренний обзор', 'completed', at(2, 7), 'lightbulb', 'План дня на 10 минут'),
        milestone('cof-focus', 'Фокус', 'completed', at(2, 8), 'target', 'Блоки без отвлечений'),
        milestone('cof-learn', 'Обучение', 'active', at(2, 9), 'graduation-cap', 'Курс и навык в практике'),
        milestone('cof-ledger', 'Учёт расходов', 'completed', at(2, 10), 'wallet-cards', 'Все траты в одном месте'),
        milestone('cof-budget', 'Бюджет', 'completed', at(2, 11), 'folder-kanban', 'Лимиты по категориям'),
        milestone('cof-debt', 'План долгов', 'active', at(2, 12), 'briefcase', 'График выплат'),

        milestone('cof-ds', 'Дизайн-система', 'completed', at(3, 0), 'folder-kanban', 'Токены и компоненты'),
        milestone('cof-ux', 'UX-потоки', 'completed', at(3, 1), 'map', 'Онбординг и сценарии'),
        milestone('cof-arch', 'Архитектура', 'completed', at(3, 2), 'briefcase', 'Сторы, sync, доступ'),
        milestone('cof-cardio', 'Кардио', 'completed', at(3, 4), 'trending-up', 'Зона 2 и интервалы'),
        milestone('cof-food', 'Питание', 'active', at(3, 5), 'award', 'Белок и ритм еды'),
        milestone('cof-recover', 'Восстановление', 'pending', at(3, 6), 'heart', 'Мобилити, свет, отдых'),
        milestone('cof-deep', 'Глубокая работа', 'completed', at(3, 7), 'target', 'Сессии без шума'),
        milestone('cof-read', 'Чтение', 'active', at(3, 8), 'book-open', 'Регулярный ритм книг'),
        milestone('cof-notes', 'Система знаний', 'pending', at(3, 9), 'brain', 'Связанные заметки'),
        milestone('cof-cushion', 'Подушка', 'active', at(3, 10), 'home', 'Резерв на месяц жизни'),
        milestone('cof-save', 'Автонакопления', 'pending', at(3, 11), 'calendar-days', 'Перевод в день зарплаты'),

        milestone('cof-fe', 'Frontend ядро', 'completed', at(4, 1), 'code', 'Экраны, доска, привычки'),
        milestone('cof-be', 'Backend', 'active', at(4, 2), 'briefcase', 'Auth, данные, правила'),
        milestone('cof-shape', 'Пиковая форма', 'pending', at(4, 5), 'trophy', 'Устойчивый уровень энергии'),
        milestone('cof-streak', 'Стрик фокуса', 'active', at(4, 7), 'trophy', 'Серия продуктивных дней'),
        milestone('cof-invest', 'Инвестиции', 'pending', at(4, 10), 'trending-up', 'Первый портфель'),

        milestone('cof-analytics', 'Аналитика', 'active', at(5, 2), 'trending-up', 'Метрики, чтобы видеть сдвиг'),
        milestone('cof-beta', 'Бета-круг', 'pending', at(5, 4), 'rocket', 'Закрытый круг пользователей'),
        milestone('cof-rhythm', 'Устойчивый ритм', 'pending', at(5, 7), 'calendar-days', 'Всё сходится в одну неделю'),
        milestone('cof-release', 'Релиз 1.0', 'pending', at(5, 5), 'flag', 'Публичный запуск продукта'),
      ],
      order: 0,
      position: { x: 40, y: 48 + 6 * ROW },
    },
  ]
}

function buildDemoEdges(): Edge[] {
  const links: Array<[string, string]> = [
    ['COF', 'cof-vision'],
    ['cof-vision', 'cof-product'],
    ['cof-vision', 'cof-body'],
    ['cof-vision', 'cof-mind'],
    ['cof-vision', 'cof-money'],

    ['cof-product', 'cof-research'],
    ['cof-product', 'cof-brand'],
    ['cof-product', 'cof-plan'],
    ['cof-research', 'cof-ds'],
    ['cof-ds', 'cof-fe'],
    ['cof-brand', 'cof-ux'],
    ['cof-ux', 'cof-be'],
    ['cof-plan', 'cof-arch'],
    ['cof-fe', 'cof-analytics'],
    ['cof-analytics', 'cof-beta'],
    ['cof-beta', 'cof-release'],

    ['cof-body', 'cof-checkup'],
    ['cof-body', 'cof-sleep'],
    ['cof-body', 'cof-strength'],
    ['cof-checkup', 'cof-cardio'],
    ['cof-sleep', 'cof-recover'],
    ['cof-strength', 'cof-food'],
    ['cof-food', 'cof-shape'],

    ['cof-mind', 'cof-review'],
    ['cof-mind', 'cof-focus'],
    ['cof-mind', 'cof-learn'],
    ['cof-focus', 'cof-deep'],
    ['cof-deep', 'cof-streak'],
    ['cof-streak', 'cof-rhythm'],
    ['cof-learn', 'cof-read'],
    ['cof-read', 'cof-notes'],

    ['cof-money', 'cof-ledger'],
    ['cof-money', 'cof-budget'],
    ['cof-money', 'cof-debt'],
    ['cof-ledger', 'cof-cushion'],
    ['cof-budget', 'cof-save'],
    ['cof-cushion', 'cof-invest'],
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

  const expected = buildDemoEdges()
  const demoNodeIds = new Set(
    branchesStore.branches.flatMap((branch) =>
      DEMO_BRANCH_IDS.includes(branch.id as (typeof DEMO_BRANCH_IDS)[number])
        ? [branch.id, ...(branch.milestones || []).map((item) => item.id)]
        : []
    )
  )
  const current = branchesStore.edges.filter(
    (edge) => demoNodeIds.has(edge.source) && demoNodeIds.has(edge.target)
  )
  const matches =
    current.length === expected.length &&
    expected.every((edge) =>
      current.some((item) => item.source === edge.source && item.target === edge.target)
    )
  if (matches) return

  branchesStore.replaceEdges(expected)
}


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
    ['Собрать финансовый контур на доске', [tagIds.work]],
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
  const health = tagsStore.addTag({ name: 'Здоровье', color: 'var(--success)', order: 1, branchId: 'COF' })
  const work = tagsStore.addTag({ name: 'Работа', color: 'var(--warning)', order: 2, branchId: 'COF' })
  const learn = tagsStore.addTag({ name: 'Учёба', color: 'var(--gold)', order: 3, branchId: 'COF' })
  const money = tagsStore.addTag({ name: 'Деньги', color: 'var(--bronze)', order: 4, branchId: 'COF' })

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
      bio: 'Одна ветка жизни: четыре потока от видения к релизу',
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
