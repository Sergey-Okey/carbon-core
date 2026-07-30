import type { Edge } from '@vue-flow/core'
import type { Branch, Milestone } from '~/types/branch.types'
import type { Task, TaskType } from '~/types/task.types'
import { useAccessStore } from '~/stores/access.store'
import { useBranchesStore } from '~/stores/branches.store'
import { useTagsStore } from '~/stores/tags.store'
import { useTasksStore } from '~/stores/tasks.store'
import { useUserStore } from '~/stores/user.store'
import { accessAwareStorage } from '~/utils/accessStorage'

const DEMO_SEED_KEY = 'carbon-demo-workspace-seeded-v5'
const edgeStyle = { stroke: 'var(--dim)', strokeWidth: 1.15 }

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
  // Varied density so heatmap levels and the activity line read clearly.
  const pattern = [
    0, 1, 2, 0, 4, 6, 1, 0, 3, 5, 8, 2, 1, 0, 2, 7, 9, 4, 1, 0, 3, 5, 8, 6, 2, 0, 4, 7, 3, 5,
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
  const hours = [8, 9, 10, 11, 12, 14, 15, 16, 18, 19, 20, 21]
  const entries: {
    id: string
    at: number
    taskId: string
    type: TaskType
    title: string
  }[] = []

  history.forEach((day, dayIndex) => {
    for (let i = 0; i < day.count; i += 1) {
      const seed = taskPool[(dayIndex + i) % Math.max(taskPool.length, 1)]
      if (!seed) continue
      const hour = hours[(dayIndex + i) % hours.length]
      const base = new Date(`${day.date}T00:00:00`)
      entries.push({
        id: `demo-log-${day.date}-${i}`,
        at: atHour(base, hour, (i * 7) % 60),
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
  icon = 'target'
): Milestone {
  return {
    id,
    name,
    icon,
    description: '',
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
      description: 'Главный продукт и ритм жизни',
      markerColor: '#d6d6d6',
      taskIds: [],
      milestones: [
        milestone('cof-m1', 'Идея и концепция', 'completed', { x: 200, y: 200 }),
        milestone('cof-m2', 'Дизайн интерфейса', 'completed', { x: 500, y: 150 }, 'palette'),
        milestone('cof-m3', 'Frontend (Vue 3)', 'completed', { x: 500, y: 300 }, 'code'),
        milestone('cof-m4', 'Backend & API', 'active', { x: 800, y: 150 }, 'server'),
        milestone('cof-m5', 'Интеграция и тестирование', 'pending', { x: 800, y: 300 }, 'test-tube'),
        milestone('cof-m6', 'Деплой и мониторинг', 'pending', { x: 1100, y: 220 }, 'rocket'),
      ],
      order: 0,
      position: { x: 50, y: 220 },
    },
    {
      id: 'BODY',
      displayName: 'Тело',
      icon: 'heart',
      description: 'Энергия, сон и движение',
      markerColor: '#4caf7f',
      taskIds: [],
      milestones: [
        milestone('body-m1', 'Режим сна', 'completed', { x: 220, y: 520 }, 'moon'),
        milestone('body-m2', 'Тренировки 3×', 'completed', { x: 520, y: 500 }, 'dumbbell'),
        milestone('body-m3', 'Питание', 'active', { x: 820, y: 520 }, 'apple'),
        milestone('body-m4', 'Восстановление', 'pending', { x: 1120, y: 500 }, 'spa'),
      ],
      order: 1,
      position: { x: 50, y: 520 },
    },
    {
      id: 'MIND',
      displayName: 'Разум',
      icon: 'brain',
      description: 'Фокус, обучение и ясность',
      markerColor: '#f59e0b',
      taskIds: [],
      milestones: [
        milestone('mind-m1', 'Утренний обзор', 'completed', { x: 220, y: 820 }),
        milestone('mind-m2', 'Глубокая работа', 'active', { x: 520, y: 800 }),
        milestone('mind-m3', 'Чтение', 'pending', { x: 820, y: 820 }),
      ],
      order: 2,
      position: { x: 50, y: 820 },
    },
    {
      id: 'FIN',
      displayName: 'Финансы',
      icon: 'wallet',
      description: 'Бюджет и рост капитала',
      markerColor: '#ffd700',
      taskIds: [],
      milestones: [
        milestone('fin-m1', 'Учёт расходов', 'completed', { x: 220, y: 1120 }),
        milestone('fin-m2', 'Подушка', 'pending', { x: 520, y: 1100 }),
        milestone('fin-m3', 'Инвестиции', 'pending', { x: 820, y: 1120 }),
      ],
      order: 3,
      position: { x: 50, y: 1120 },
    },
  ]
}

function buildDemoEdges(): Edge[] {
  const links: Array<[string, string]> = [
    ['COF', 'cof-m1'],
    ['cof-m1', 'cof-m2'],
    ['cof-m1', 'cof-m3'],
    ['cof-m2', 'cof-m4'],
    ['cof-m3', 'cof-m5'],
    ['cof-m4', 'cof-m6'],
    ['cof-m5', 'cof-m6'],
    ['BODY', 'body-m1'],
    ['body-m1', 'body-m2'],
    ['body-m2', 'body-m3'],
    ['body-m3', 'body-m4'],
    ['MIND', 'mind-m1'],
    ['mind-m1', 'mind-m2'],
    ['mind-m2', 'mind-m3'],
    ['FIN', 'fin-m1'],
    ['fin-m1', 'fin-m2'],
    ['fin-m2', 'fin-m3'],
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
  const demoBranchIds = ['BODY', 'MIND', 'FIN']
  const hasDemoBranches = demoBranchIds.every((id) =>
    branchesStore.branches.some((branch) => branch.id === id)
  )
  if (!hasDemoBranches) return

  const connectedRoots = new Set(
    branchesStore.edges
      .filter((edge) => demoBranchIds.includes(edge.source))
      .map((edge) => edge.source)
  )
  const missing = demoBranchIds.some((id) => !connectedRoots.has(id))
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

  return [
    {
      id: 'demo-habit-1',
      title: 'Утренняя зарядка',
      type: 'HABIT',
      tagIds: [tagIds.health],
      lastCompletedAt: atHour(today, 7, 20),
      createdAt: atHour(d(40), 9),
    },
    {
      id: 'demo-habit-2',
      title: 'Медитация 10 мин',
      type: 'HABIT',
      tagIds: [tagIds.focus],
      lastCompletedAt: atHour(today, 8, 5),
      createdAt: atHour(d(35), 9),
    },
    {
      id: 'demo-habit-3',
      title: 'Чтение',
      type: 'HABIT',
      tagIds: [tagIds.learn],
      lastCompletedAt: atHour(d(1), 21, 10),
      createdAt: atHour(d(28), 9),
    },
    {
      id: 'demo-habit-4',
      title: 'Вода 2л',
      type: 'HABIT',
      tagIds: [tagIds.health],
      lastCompletedAt: atHour(today, 18, 40),
      createdAt: atHour(d(20), 9),
    },
    {
      id: 'demo-habit-5',
      title: 'Без соцсетей до обеда',
      type: 'HABIT',
      tagIds: [tagIds.focus, tagIds.work],
      createdAt: atHour(d(14), 9),
    },
    {
      id: 'demo-habit-6',
      title: 'Вечерний обзор дня',
      type: 'HABIT',
      tagIds: [tagIds.focus],
      lastCompletedAt: atHour(d(1), 22, 15),
      createdAt: atHour(d(18), 9),
    },
    {
      id: 'demo-day-1',
      title: 'Закрыть релиз аналитики',
      type: 'TASK_DAY',
      tagIds: [tagIds.work, tagIds.focus],
      done: true,
      completedAt: atHour(today, 11, 30),
      createdAt: atHour(d(1), 9),
    },
    {
      id: 'demo-day-2',
      title: 'Созвон с командой',
      type: 'TASK_DAY',
      tagIds: [tagIds.work],
      done: true,
      completedAt: atHour(d(1), 16, 10),
      createdAt: atHour(d(2), 9),
    },
    {
      id: 'demo-day-3',
      title: 'Спланировать спринт',
      type: 'TASK_DAY',
      tagIds: [tagIds.work, tagIds.focus],
      createdAt: atHour(today, 8),
    },
    {
      id: 'demo-week-1',
      title: 'Пробежать 15 км',
      type: 'TASK_WEEK',
      tagIds: [tagIds.health],
      done: true,
      completedAt: atHour(d(3), 19, 20),
      createdAt: atHour(d(10), 9),
    },
    {
      id: 'demo-week-2',
      title: 'Глубокая работа 4 блока',
      type: 'TASK_WEEK',
      tagIds: [tagIds.focus, tagIds.work],
      createdAt: atHour(d(4), 9),
    },
    {
      id: 'demo-week-3',
      title: 'Разобрать финансы недели',
      type: 'TASK_WEEK',
      tagIds: [tagIds.money],
      done: true,
      completedAt: atHour(d(5), 20, 45),
      createdAt: atHour(d(8), 9),
    },
    {
      id: 'demo-month-1',
      title: 'Закончить онбординг',
      type: 'TASK_MONTH',
      tagIds: [tagIds.work, tagIds.learn],
      done: true,
      completedAt: atHour(d(8), 14, 0),
      createdAt: atHour(d(25), 9),
    },
    {
      id: 'demo-month-2',
      title: 'Улучшить сон до 7.5ч',
      type: 'TASK_MONTH',
      tagIds: [tagIds.health],
      createdAt: atHour(d(12), 9),
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
      done: true,
      completedAt: atHour(d(12), 21, 30),
      createdAt: atHour(d(90), 9),
    },
    // Extra completions at varied hours so the polar clock looks alive
    {
      id: 'demo-done-a',
      title: 'Ответить на письма',
      type: 'TASK_DAY',
      tagIds: [tagIds.work],
      done: true,
      completedAt: atHour(d(2), 9, 40),
      createdAt: atHour(d(3), 9),
    },
    {
      id: 'demo-done-b',
      title: 'Сделать заметки по книге',
      type: 'TASK_DAY',
      tagIds: [tagIds.learn],
      done: true,
      completedAt: atHour(d(2), 22, 5),
      createdAt: atHour(d(3), 10),
    },
    {
      id: 'demo-done-c',
      title: 'Тренировка ног',
      type: 'TASK_DAY',
      tagIds: [tagIds.health],
      done: true,
      completedAt: atHour(d(4), 18, 15),
      createdAt: atHour(d(5), 9),
    },
    {
      id: 'demo-done-d',
      title: 'Ревью UI-референсов',
      type: 'TASK_DAY',
      tagIds: [tagIds.work, tagIds.focus],
      done: true,
      completedAt: atHour(d(6), 13, 25),
      createdAt: atHour(d(7), 9),
    },
  ]
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
    leaguePoints: 2480,
    completedTasksCount: Math.max(completedCount, 86),
    profile: {
      name: 'Алекс',
      bio: 'Демо-профиль Core of Life',
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
