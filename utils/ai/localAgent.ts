import type { AiActResponse, AiContext, AiOperation } from '../../types/ai.types.ts'
import type { TaskType } from '../../types/task.types.ts'
import { parseAiResponse, remainingSlots } from './operations.ts'

type LocalIntent =
  | { kind: 'help' }
  | { kind: 'briefing' }
  | { kind: 'inspect' }
  | { kind: 'habit'; title: string }
  | { kind: 'task'; title: string; type: TaskType }
  | { kind: 'complete'; query: string }
  | { kind: 'delete'; query: string }
  | { kind: 'theme'; mode: 'dark' | 'light' }
  | { kind: 'planExisting' }
  | { kind: 'decompose'; title: string }

function normalize(text: string) {
  return text.toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim()
}

function shiftDate(today: string, days: number) {
  const date = new Date(`${today}T12:00:00`)
  date.setDate(date.getDate() + days)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function stripCommands(text: string) {
  return text
    .replace(
      /^(пожалуйста[,!]?\s+)?(сделай|создай|добавь|разложи|спланируй|построй|запланируй|хочу|нужно|поставь|отметь|заверши|закрой|удали|убери)\s+/i,
      ''
    )
    .replace(/^(задачу|задача|привычку|привычка|ветку|ветка|цель|этап)\s+/i, '')
    .replace(/\s+(на этапы и задачи|на этапы|и задачи|на доске|пожалуйста|текущие цели|текущие цель)$/i, '')
    .replace(/\s+на (день|неделю|месяц|год)$/i, '')
    .replace(/[?.!]+$/g, '')
    .trim()
}

function pickIcon(title: string) {
  const text = normalize(title)
  if (/спорт|зал|бег|тренир|тело|фитнес|йога|зарядк/.test(text)) return 'dumbbell'
  if (/книг|чит|учеб|курс|язык|мозг/.test(text)) return 'book-open'
  if (/канал|контент|блог|youtube|видео|бренд/.test(text)) return 'rocket'
  if (/работ|проект|бизнес|стартап|клиент/.test(text)) return 'briefcase'
  if (/деньг|финанс|бюджет|инвест/.test(text)) return 'wallet-cards'
  if (/код|программ|сайт|прилож/.test(text)) return 'code'
  if (/дом|семь|отношен/.test(text)) return 'home'
  if (/здоров|сон|питани/.test(text)) return 'heart'
  return 'target'
}

function takeSlots(context: AiContext, type: TaskType, count: number) {
  const remaining = remainingSlots(context, type)
  if (remaining == null) return count
  return Math.max(0, Math.min(count, remaining))
}

function scoreName(title: string, needle: string) {
  const text = normalize(title)
  if (!needle) return 0
  if (text === needle) return 100
  if (text.includes(needle) || needle.includes(text)) return 70
  const words = needle.split(' ').filter((word) => word.length > 2)
  if (!words.length) return 0
  return words.filter((word) => text.includes(word)).length * 18
}

function findTask(context: AiContext, query: string, includeDone = false) {
  const needle = normalize(stripCommands(query) || query)
  if (!needle) return null
  const scored = context.tasks
    .filter((task) => includeDone || !task.done)
    .map((task) => ({ task, score: scoreName(task.title, needle) }))
    .filter((item) => item.score >= 18)
    .sort((left, right) => right.score - left.score)
  return scored[0]?.task ?? null
}

function findBranch(context: AiContext, query: string) {
  const needle = normalize(stripCommands(query) || query)
  if (!needle) return null
  const scored = context.branches
    .map((branch) => ({ branch, score: scoreName(branch.displayName, needle) }))
    .filter((item) => item.score >= 18)
    .sort((left, right) => right.score - left.score)
  return scored[0]?.branch ?? null
}

function scoreTask(task: AiContext['tasks'][number], context: AiContext) {
  let score = 10
  if (task.type === 'TASK_DAY') score += 40
  if (task.type === 'HABIT') score += 28
  if (task.type === 'TASK_WEEK') score += 18
  if (task.targetDate && task.targetDate <= context.today) score += 35
  if (task.targetDate && task.targetDate < context.today) score += 25
  if (
    context.branches.some((branch) =>
      branch.milestones.some(
        (milestone) => milestone.status === 'active' && milestone.taskIds.includes(task.id)
      )
    )
  ) {
    score += 12
  }
  return score
}

export function detectIntent(request: string): LocalIntent {
  const text = normalize(request)

  if (
    /^(привет|здравствуй|хай|hello|hi)\b/.test(text) ||
    /что ты умеешь|как (тобой )?пользоваться|чем можешь помочь|^помоги$/.test(text)
  ) {
    return { kind: 'help' }
  }

  if (/темн(ая|ый|ую) тем|включи темн|dark/.test(text)) return { kind: 'theme', mode: 'dark' }
  if (/светл(ая|ый|ую) тем|включи светл|light/.test(text)) return { kind: 'theme', mode: 'light' }

  if (/что делать|брифинг|план на сегодня|три главн|что сегодня|с чего начать/.test(text)) {
    return { kind: 'briefing' }
  }

  if (/^(отметь|заверши|закрой|сделал)\b/.test(text) || /как выполнен/.test(text)) {
    return { kind: 'complete', query: request }
  }

  if (/^(удали|убери|удалить)\b/.test(text)) {
    return { kind: 'delete', query: request }
  }

  if (
    /^(что|какие|сколько|где|покажи|список)\b/.test(text) &&
    !/(создай|добавь|разлож|спланир)/.test(text)
  ) {
    return { kind: 'inspect' }
  }

  if (/привычк/.test(text) || /каждый день|ежедневн/.test(text)) {
    return { kind: 'habit', title: stripCommands(request) || 'Новая привычка' }
  }

  const period: Array<[RegExp, TaskType]> = [
    [/на год|годов/, 'TASK_YEAR'],
    [/на месяц|месячн/, 'TASK_MONTH'],
    [/на неделю|недельн/, 'TASK_WEEK'],
    [/на день|дневн/, 'TASK_DAY'],
  ]
  for (const [pattern, type] of period) {
    if (pattern.test(text) && /(задач|добав|создай|поставь)/.test(text)) {
      return { kind: 'task', type, title: stripCommands(request) || 'Новая задача' }
    }
  }

  if (/текущ(ие|ую) цел/.test(text) || (/разлож/.test(text) && /(текущ|доск|этап)/.test(text) && !stripCommands(request))) {
    return { kind: 'planExisting' }
  }

  if (
    /разлож|спланир|запланир|на этапы|построй план|цель:/.test(text) ||
    (/(создай|добавь)/.test(text) && /ветк|проект/.test(text))
  ) {
    return { kind: 'decompose', title: stripCommands(request) || 'Новая цель' }
  }

  if (/^(добавь|создай|поставь)\s+/.test(text)) {
    return { kind: 'task', type: 'TASK_DAY', title: stripCommands(request) || 'Новая задача' }
  }

  return { kind: 'briefing' }
}

function help(): { message: string; operations: AiOperation[] } {
  return {
    message:
      'Могу подсказать, что делать сегодня, добавить привычку или задачу, отметить выполненное и разложить цель на ветку с этапами. Напишите, например: «Добавь привычку читать 20 минут».',
    operations: [],
  }
}

function briefing(context: AiContext): { message: string; operations: AiOperation[] } {
  const open = context.tasks.filter((task) => !task.done)
  if (!open.length) {
    return {
      message: 'Открытых задач нет. Назовите цель — разложу её на ветку и этапы, либо добавьте привычку.',
      operations: [],
    }
  }

  const top = [...open].sort((left, right) => scoreTask(right, context) - scoreTask(left, context)).slice(0, 3)
  const lines = top.map((task, index) => `${index + 1}. «${task.title}»`)
  return {
    message: `Сегодня важнее всего:\n${lines.join('\n')}`,
    operations: [],
  }
}

function inspect(context: AiContext): { message: string; operations: AiOperation[] } {
  const open = context.tasks.filter((task) => !task.done)
  const branches = context.branches
  if (!open.length && !branches.length) {
    return {
      message: 'Пока пусто: нет открытых задач и веток. Назовите цель или привычку — соберу каркас.',
      operations: [],
    }
  }
  const taskLines = open.slice(0, 6).map((task) => `«${task.title}»`)
  const branchLines = branches.slice(0, 5).map((branch) => `«${branch.displayName}»`)
  const parts = []
  if (taskLines.length) parts.push(`Открытые задачи: ${taskLines.join(', ')}`)
  if (branchLines.length) parts.push(`Ветки: ${branchLines.join(', ')}`)
  return { message: parts.join('\n'), operations: [] }
}

function planGoal(title: string, context: AiContext): { message: string; operations: AiOperation[] } {
  const existing = findBranch(context, title)
  if (existing) {
    return {
      message: `Ветка «${existing.displayName}» уже есть. Напишите, какой этап или задачу добавить в неё.`,
      operations: [],
    }
  }

  const operations: AiOperation[] = [
    {
      op: 'createBranch',
      ref: '$b1',
      displayName: title.slice(0, 80),
      description: `План цели «${title}»`,
      icon: pickIcon(title),
    },
    {
      op: 'createMilestone',
      ref: '$m1',
      name: 'Старт',
      description: 'Собрать базу и первый видимый результат',
      branchId: '$b1',
    },
    {
      op: 'createMilestone',
      ref: '$m2',
      name: 'Основной ход',
      description: 'Регулярная работа и рост',
      sourceId: '$m1',
    },
    {
      op: 'createMilestone',
      ref: '$m3',
      name: 'Закрепление',
      description: 'Стабильный ритм и проверка результата',
      sourceId: '$m2',
    },
  ]

  const daySlots = takeSlots(context, 'TASK_DAY', 1)
  const weekSlots = takeSlots(context, 'TASK_WEEK', 1)
  const monthSlots = takeSlots(context, 'TASK_MONTH', 1)

  if (daySlots) {
    operations.push({
      op: 'createTask',
      ref: '$t1',
      title: `Первый шаг: ${title}`.slice(0, 160),
      type: 'TASK_DAY',
      targetDate: context.today,
      milestoneId: '$m1',
      branchId: '$b1',
    })
  }
  if (weekSlots) {
    operations.push({
      op: 'createTask',
      ref: '$t2',
      title: `Недельный блок: ${title}`.slice(0, 160),
      type: 'TASK_WEEK',
      targetDate: shiftDate(context.today, 7),
      milestoneId: '$m2',
      branchId: '$b1',
    })
  }
  if (monthSlots) {
    operations.push({
      op: 'createTask',
      ref: '$t3',
      title: `Месячный результат: ${title}`.slice(0, 160),
      type: 'TASK_MONTH',
      targetDate: shiftDate(context.today, 28),
      milestoneId: '$m3',
      branchId: '$b1',
    })
  }

  operations.push({
    op: 'createTask',
    ref: '$h1',
    title: `Ежедневное движение: ${title}`.slice(0, 160),
    type: 'HABIT',
    milestoneId: '$m2',
    branchId: '$b1',
  })

  const created = operations.filter((item) => item.op === 'createTask').length
  const taskWord =
    created % 10 === 1 && created % 100 !== 11
      ? 'задачу'
      : created % 10 >= 2 && created % 10 <= 4 && (created % 100 < 10 || created % 100 >= 20)
        ? 'задачи'
        : 'задач'
  return {
    message: `Разложил «${title}» на ветку и этапы «Старт», «Основной ход» и «Закрепление» — плюс ${created} ${taskWord}.`,
    operations,
  }
}

function planExisting(context: AiContext): { message: string; operations: AiOperation[] } {
  const operations: AiOperation[] = []
  const targets = context.branches.filter((branch) => branch.milestones.length < 2).slice(0, 3)

  if (!targets.length) {
    const open = context.tasks.filter((task) => !task.done)
    if (open.length) return briefing(context)
    return {
      message: 'На доске уже есть этапы. Назовите новую цель — добавлю отдельную ветку.',
      operations: [],
    }
  }

  let dayLeft = takeSlots(context, 'TASK_DAY', 3)
  let weekLeft = takeSlots(context, 'TASK_WEEK', 3)
  let index = 1

  for (const branch of targets) {
    const m1 = `$m${index}`
    const m2 = `$m${index + 1}`
    operations.push({
      op: 'createMilestone',
      ref: m1,
      name: 'Следующий этап',
      description: `Продолжение «${branch.displayName}»`,
      branchId: branch.id,
    })
    operations.push({
      op: 'createMilestone',
      ref: m2,
      name: 'Усиление',
      description: `Закрепить прогресс «${branch.displayName}»`,
      sourceId: m1,
    })
    if (dayLeft > 0) {
      operations.push({
        op: 'createTask',
        title: `Сегодня по «${branch.displayName}»`.slice(0, 160),
        type: 'TASK_DAY',
        targetDate: context.today,
        milestoneId: m1,
        branchId: branch.id,
      })
      dayLeft -= 1
    } else if (weekLeft > 0) {
      operations.push({
        op: 'createTask',
        title: `Неделя по «${branch.displayName}»`.slice(0, 160),
        type: 'TASK_WEEK',
        targetDate: shiftDate(context.today, 7),
        milestoneId: m2,
        branchId: branch.id,
      })
      weekLeft -= 1
    }
    index += 2
  }

  const names = targets.map((branch) => `«${branch.displayName}»`).join(', ')
  return {
    message: `Дополнил ${names} этапами «Следующий этап» и «Усиление».`,
    operations,
  }
}

export function runLocalAgent(request: string, context: AiContext): AiActResponse {
  const intent = detectIntent(request)

  if (intent.kind === 'help') return parseAiResponse(help())
  if (intent.kind === 'briefing') return parseAiResponse(briefing(context))
  if (intent.kind === 'inspect') return parseAiResponse(inspect(context))
  if (intent.kind === 'theme') {
    return parseAiResponse({
      message: intent.mode === 'dark' ? 'Включил тёмную тему.' : 'Включил светлую тему.',
      operations: [{ op: 'updateSettings', values: { themeMode: intent.mode } }],
    })
  }
  if (intent.kind === 'habit') {
    const duplicate = findTask(context, intent.title)
    if (duplicate) {
      return parseAiResponse({
        message: `Привычка «${duplicate.title}» уже есть.`,
        operations: [],
      })
    }
    return parseAiResponse({
      message: `Добавил привычку «${intent.title}».`,
      operations: [{ op: 'createTask', title: intent.title, type: 'HABIT' }],
    })
  }
  if (intent.kind === 'task') {
    const remaining = remainingSlots(context, intent.type)
    if (remaining === 0) {
      return parseAiResponse({
        message: `Слот этого периода уже заполнен. Закройте одну задачу или поставьте привычку.`,
        operations: [],
      })
    }
    const duplicate = findTask(context, intent.title)
    if (duplicate) {
      return parseAiResponse({
        message: `«${duplicate.title}» уже в списке.`,
        operations: [],
      })
    }
    return parseAiResponse({
      message: `Добавил «${intent.title}».`,
      operations: [
        {
          op: 'createTask',
          title: intent.title,
          type: intent.type,
          targetDate: intent.type === 'TASK_DAY' ? context.today : undefined,
        },
      ],
    })
  }
  if (intent.kind === 'complete') {
    const task = findTask(context, intent.query)
    if (!task) {
      return parseAiResponse({
        message: 'Не нашёл такую задачу. Напишите название из списка.',
        operations: [],
      })
    }
    return parseAiResponse({
      message: `Отмечаю «${task.title}».`,
      operations: [{ op: 'completeTask', id: task.id }],
    })
  }
  if (intent.kind === 'delete') {
    const task = findTask(context, intent.query, true)
    if (!task) {
      return parseAiResponse({
        message: 'Не нашёл, что удалить. Напишите название задачи.',
        operations: [],
      })
    }
    return parseAiResponse({
      message: `Удаляю «${task.title}».`,
      operations: [{ op: 'deleteTask', id: task.id }],
    })
  }
  if (intent.kind === 'planExisting') return parseAiResponse(planExisting(context))
  return parseAiResponse(planGoal(intent.title, context))
}
