import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildAiContext, compactAiContext } from '../utils/ai/context.ts'
import {
  extractJsonObject,
  parseAiResponse,
  parseAiTextResponse,
  remainingSlots,
} from '../utils/ai/operations.ts'
import { containsSecretPayload, isSecretKey } from '../utils/ai/secrets.ts'
import { runLocalAgent } from '../utils/ai/localAgent.ts'
import {
  POLLINATIONS_ANON_MODEL,
  POLLINATIONS_ORIGIN,
  buildPollinationsGetUrl,
  buildPollinationsPrompt,
  isPollinationsFailurePayload,
  runPollinationsAgent,
} from '../utils/ai/pollinations.ts'
import {
  linksFromApplyResults,
  linksFromQuotedTitles,
  stripPublicFallbackNotice,
} from '../utils/ai/chat.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (relativePath) => readFile(join(root, relativePath), 'utf8')

test('secret detector blocks passwords, tokens, and email fields', () => {
  assert.equal(isSecretKey('password'), true)
  assert.equal(isSecretKey('passwordHash'), true)
  assert.equal(isSecretKey('email'), true)
  assert.equal(isSecretKey('smtpPassword'), true)
  assert.equal(isSecretKey('title'), false)
  assert.equal(isSecretKey('displayName'), false)
  assert.equal(
    containsSecretPayload({
      operations: [{ op: 'updateProfile', password: 'secret' }],
    }),
    true
  )
})

test('AI context drops confidential fields and keeps workspace facts', () => {
  const stripped = buildAiContext({
    password: 'hunter2',
    email: 'hidden@example.com',
    avatar: 'https://example.com/a.png',
    tasks: [{ id: '1', title: 'Read', type: 'HABIT' }],
  })
  assert.equal(stripped.tasks[0].title, 'Read')
  assert.equal(JSON.stringify(stripped).includes('hunter2'), false)
  assert.equal(JSON.stringify(stripped).includes('hidden@example.com'), false)

  const context = buildAiContext({
    today: '2026-08-25',
    tasks: [
      { id: 't1', title: 'Write post', type: 'TASK_DAY', done: false, tagIds: [] },
      { id: 't2', title: 'Write post 2', type: 'TASK_DAY', done: false, tagIds: [] },
      { id: 'h1', title: 'Run', type: 'HABIT', done: false, tags: [{ name: 'body' }] },
    ],
    branches: [
      {
        id: 'b1',
        displayName: 'Body',
        icon: 'dumbbell',
        milestones: [{ id: 'm1', name: 'Base', status: 'active', taskIds: ['h1'] }],
      },
    ],
    progress: { name: 'Serge', bio: 'Builder', level: 3, league: 'Серебро', leaguePoints: 1200 },
    memory: [{ at: Date.now(), request: 'Plan week', message: 'Done', applied: ['Ветка'] }],
  })

  assert.equal(context.today, '2026-08-25')
  assert.equal(context.slots.TASK_DAY.remaining, 1)
  assert.equal(context.slots.HABIT.remaining, null)
  assert.equal(context.tasks.length, 3)
  assert.equal(context.branches[0].milestones[0].name, 'Base')
  assert.equal(context.progress.email, undefined)
  assert.equal(context.progress.name, 'Serge')
  assert.equal(JSON.stringify(context).includes('hunter2'), false)
  assert.equal(JSON.stringify(context).includes('password'), false)
})

test('AI response parser keeps valid ops, sorts creates first, and rejects secrets', () => {
  const parsed = parseAiResponse({
    message: 'Разложил цель на ветку и задачи',
    operations: [
      { op: 'createTask', ref: '$t1', title: 'Сценарий', type: 'TASK_WEEK' },
      { op: 'createBranch', ref: '$b1', displayName: 'Канал', icon: 'rocket' },
      { op: 'linkTask', taskId: '$t1', branchId: '$b1' },
      { op: 'unknownOp', title: 'nope' },
      { op: 'createTask', title: '', type: 'TASK_DAY' },
    ],
  })

  assert.equal(parsed.operations[0].op, 'createBranch')
  assert.equal(parsed.operations[1].op, 'createTask')
  assert.equal(parsed.operations[2].op, 'linkTask')
  assert.equal(parsed.operations.length, 3)
  assert.equal(remainingSlots(buildAiContext({}), 'TASK_DAY'), 3)

  const stripped = parseAiResponse({
    message: 'ok',
    password: 'nope',
    operations: [{ op: 'updateProfile', name: 'X', password: 'nope' }],
  })
  assert.equal(stripped.message, 'ok')
  assert.equal(stripped.operations[0].op, 'updateProfile')
  assert.equal(JSON.stringify(stripped).includes('nope'), false)
})

test('local agent plans, briefs, and adds habits without a cloud model', () => {
  const empty = buildAiContext({ today: '2026-08-25' })
  const planned = runLocalAgent('Разложи запуск канала', empty)
  assert.equal(planned.operations.some((item) => item.op === 'createBranch'), true)
  assert.equal(planned.operations.filter((item) => item.op === 'createMilestone').length, 3)
  assert.equal(planned.operations.some((item) => item.op === 'createTask' && item.type === 'HABIT'), true)
  assert.match(planned.message, /канал/i)
  assert.match(planned.message, /«Старт»/)
  assert.match(planned.message, /«Основной ход»/)

  const habit = runLocalAgent('Добавь привычку читать 20 минут', empty)
  assert.deepEqual(
    habit.operations.filter((item) => item.op === 'createTask').map((item) => [item.type, item.title]),
    [['HABIT', 'читать 20 минут']]
  )

  const briefing = runLocalAgent(
    'Что делать сегодня?',
    buildAiContext({
      today: '2026-08-25',
      tasks: [
        { id: 't1', title: 'Написать пост', type: 'TASK_DAY', done: false, targetDate: '2026-08-25' },
        { id: 'h1', title: 'Пробежка', type: 'HABIT', done: false },
      ],
    })
  )
  assert.equal(briefing.operations.length, 0)
  assert.match(briefing.message, /Написать пост/)
  assert.match(briefing.message, /Пробежка/)

  const hello = runLocalAgent('Привет', empty)
  assert.equal(hello.operations.length, 0)
  assert.match(hello.message, /привычку|задачу/i)

  const dayTask = runLocalAgent('Добавь задачу купить молоко', empty)
  assert.deepEqual(
    dayTask.operations.filter((item) => item.op === 'createTask').map((item) => [item.type, item.title]),
    [['TASK_DAY', 'купить молоко']]
  )

  const duplicate = runLocalAgent(
    'Добавь привычку читать 20 минут',
    buildAiContext({
      today: '2026-08-25',
      tasks: [{ id: 'h1', title: 'читать 20 минут', type: 'HABIT', done: false }],
    })
  )
  assert.equal(duplicate.operations.length, 0)
  assert.match(duplicate.message, /уже есть/)
})

test('AI parser extracts JSON from model text and compact context drops bulky fields', () => {
  const fenced = extractJsonObject('Sure.\n```json\n{"message":"Ок","operations":[]}\n```')
  assert.equal(fenced?.message, 'Ок')
  const parsed = parseAiTextResponse(
    'Вот план:\n{"message":"Добавил привычку","operations":[{"op":"createTask","title":"Читать","type":"HABIT"}]}'
  )
  assert.equal(parsed.operations[0]?.op, 'createTask')
  assert.equal(isPollinationsFailurePayload('{"error":"402 Payment Required","status":402}'), true)
  assert.equal(isPollinationsFailurePayload('{"message":"Ок","operations":[]}'), false)

  const compact = compactAiContext(
    buildAiContext({
      tasks: Array.from({ length: 8 }, (_, index) => ({
        id: `t${index}`,
        title: `Task ${index}`,
        type: 'HABIT',
        description: 'long text that should not ship to the public URL',
      })),
    })
  )
  assert.equal(JSON.stringify(compact).includes('long text'), false)
})

test('chat copy strips fallback notice and turns titles into workspace links', () => {
  assert.equal(
    stripPublicFallbackNotice('Публичная модель недоступна, сработал встроенный агент. Добавил привычку.'),
    'Добавил привычку.'
  )
  const links = linksFromQuotedTitles('Сегодня: «Написать пост» и этап «Старт»', {
    tasks: [{ id: 't1', title: 'Написать пост' }],
    branches: [{ id: 'b1', displayName: 'Канал', milestones: [{ id: 'm1', name: 'Старт' }] }],
  })
  assert.deepEqual(
    links.map((item) => [item.kind, item.id]),
    [
      ['task', 't1'],
      ['milestone', 'm1'],
    ]
  )
  assert.deepEqual(
    linksFromApplyResults([
      { op: 'createBranch', ok: true, detail: 'Ветка', entity: { kind: 'branch', id: 'b1', label: 'Канал' } },
      { op: 'createTask', ok: false, detail: 'fail', entity: { kind: 'task', id: 'x', label: 'x' } },
    ]).map((item) => item.id),
    ['b1']
  )
})

test('Pollinations client uses the public GET API without a key and falls back on 402', async () => {
  const context = buildAiContext({ today: '2026-08-25' })
  const url = buildPollinationsGetUrl(buildPollinationsPrompt('Добавь привычку читать', context))
  assert.equal(url.startsWith(`${POLLINATIONS_ORIGIN}/`), true)
  assert.match(url, new RegExp(`[?&]model=${POLLINATIONS_ANON_MODEL}`))
  assert.doesNotMatch(url, /json=true/)
  assert.doesNotMatch(url, /Authorization|api[_-]?key/i)

  const mocked = await runPollinationsAgent('Добавь привычку читать', context, {
    fetcher: async () =>
      new Response(
        '{"message":"Добавил привычку","operations":[{"op":"createTask","title":"читать","type":"HABIT"}]}',
        { status: 200 }
      ),
  })
  assert.equal(mocked.operations[0]?.op, 'createTask')

  await assert.rejects(
    () =>
      runPollinationsAgent('x', context, {
        fetcher: async () =>
          new Response('{"error":"402 Payment Required","status":402}', { status: 402 }),
      }),
    /Pollinations request failed/
  )
})

test('AI endpoint stays server-side, rate limited, and defaults to OpenRouter', async () => {
  const endpoint = await read('server/api/ai/act.post.ts')
  const config = await read('nuxt.config.ts')
  const publicBlock = config.match(/public:\s*\{[\s\S]*?\n\s*\},/)?.[0] || ''
  const panel = await read('components/ai/AiAgentPanel.vue')
  const apply = await read('utils/ai/apply.ts')
  const llm = await read('server/utils/aiLlm.ts')
  const prompt = await read('utils/ai/prompt.ts')
  const envExample = await read('.env.example')
  const pollinations = await read('utils/ai/pollinations.ts')
  const pkg = await read('package.json')
  const app = await read('app.vue')

  assert.match(endpoint, /enforceRateLimit\(event, 'ai-act'/)
  assert.match(endpoint, /resolveAiApiKey/)
  assert.match(endpoint, /AI_ENGINE \|\| 'openai'/)
  assert.doesNotMatch(endpoint, /AI is not configured/)
  assert.match(config, /aiEngine: process\.env\.AI_ENGINE \|\| 'openai'/)
  assert.match(config, /openrouter\.ai\/api\/v1/)
  assert.match(config, /process\.env\.OPENAI_API_KEY/)
  assert.match(llm, /resolveAiApiKey/)
  assert.match(llm, /NUXT_OPENAI_API_KEY/)
  assert.doesNotMatch(config, /VERCEL|@vercel/)
  assert.doesNotMatch(publicBlock, /openaiApiKey|OPENAI_API_KEY/)
  assert.doesNotMatch(pkg, /@vercel\/analytics|@vercel\/speed-insights/)
  assert.doesNotMatch(app, /SpeedInsights|@vercel/)
  assert.match(panel, /agent-shell/)
  assert.match(panel, /agent-thread/)
  assert.match(panel, /agent-composer/)
  assert.match(panel, /Агент печатает/)
  assert.doesNotMatch(panel, /AppModal/)
  assert.doesNotMatch(panel, /kicker/)
  assert.doesNotMatch(panel, /Pollinations|OpenRouter|облачная модель|Запрос/)
  assert.doesNotMatch(panel, /v-html/)
  const agent = await read('composables/useAiAgent.ts')
  assert.match(agent, /runLocalAgent\(text, snapshot\)/)
  assert.doesNotMatch(agent, /!== 401/)
  const hub = await read('components/ai/AiHub.vue')
  const header = await read('components/base/TheHeader.vue')
  const mobileBoard = await read('components/branch/BranchMobileView.vue')
  assert.match(hub, /ai-hub/)
  assert.match(hub, /Чем помочь сегодня/)
  assert.match(hub, /Спросите что угодно/)
  const layout = await read('layouts/default.vue')
  const glow = await read('components/ai/BoardAiGlow.vue')
  const dock = await read('components/ai/BoardDock.vue')
  assert.match(layout, /LazyBoardAiGlow|BoardAiGlow/)
  assert.match(glow, /board-ai-glow/)
  assert.match(glow, /useAnalyticsMetrics/)
  assert.match(glow, /useDeviceTilt/)
  assert.match(glow, /--glow-scale/)
  assert.match(glow, /118dvh/)
  assert.match(glow, /#7ee7ff/)
  assert.match(glow, /html\.light-theme/)
  assert.doesNotMatch(glow, /--bronze|--gold|--glow-core/)
  assert.match(hub, /hub-enter/)
  assert.match(mobileBoard, /AiHub/)
  assert.doesNotMatch(mobileBoard, /board-ai-in/)
  assert.match(hub, /BoardDock/)
  assert.match(hub, /--chip-x/)
  assert.match(hub, /hub-chip-drift/)
  assert.match(dock, /board-dock__swap/)
  assert.match(dock, /island-swipe-hint/)
  assert.match(dock, /toggleBoardDock/)
  assert.match(dock, /is-waiting/)
  assert.match(dock, /launchReady/)
  assert.match(dock, /translateY\(calc\(100%/)
  assert.match(panel, /is-waiting/)
  assert.match(panel, /neon-wait-edge/)
  assert.match(await read('assets/styles/mixins.scss'), /--neon-width: 1px/)
  const index = await read('pages/index.vue')
  const tilt = await read('composables/useDeviceTilt.ts')
  const flow = await read('components/branch/BranchFlow.vue')
  assert.match(index, /BranchMobileView v-if="isMobileBoard"/)
  assert.match(index, /LazyBranchFlow v-else|BranchFlow v-else/)
  assert.doesNotMatch(flow, /BranchMobileView/)
  assert.match(index, /LazyAnalyticsPanel|AnalyticsPanel/)
  assert.match(index, /LazySettingsPanel|SettingsPanel/)
  assert.match(index, /LazyFocusPanel|FocusPanel/)
  assert.match(await read('composables/useLaunchGate.ts'), /launchReady/)
  assert.match(await read('components/base/AppLaunchScreen.vue'), /launch-complete/)
  assert.match(await read('components/base/TheNavbar.vue'), /launchReady/)
  assert.match(tilt, /globalThis/)
  assert.doesNotMatch(tilt, /=\s*DeviceOrientationEvent/)
  const agentButton = await read('components/base/header/HeaderAgentButton.vue')
  const headerActions = await read('components/base/header/HeaderQuickActions.vue')
  assert.match(header, /HeaderAgentButton/)
  assert.match(agentButton, /Открыть агента/)
  assert.match(agentButton, /Sparkles/)
  assert.match(agentButton, /header-agent-gradient/)
  assert.match(headerActions, /header-agent-trigger/)
  assert.match(mobileBoard, /AiHub/)
  assert.doesNotMatch(mobileBoard, /Доска пока на компьютере/)
  assert.match(apply, /createBranch/)
  assert.match(apply, /createTask/)
  assert.match(apply, /updateProfile/)
  assert.doesNotMatch(apply, /password/)
  assert.match(llm, /runPollinationsAgent/)
  assert.match(llm, /runLocalAgent/)
  assert.match(llm, /AI_SYSTEM_PROMPT/)
  assert.match(llm, /minimax\/minimax-m2\.7:free/)
  assert.match(prompt, /Нельзя: пароли/)
  assert.match(prompt, /Не создавай новую ветку/)
  assert.match(envExample, /AI_ENGINE=openai/)
  assert.match(envExample, /openrouter\.ai/)
  assert.match(pollinations, /text\.pollinations\.ai/)
  assert.match(pollinations, /openai-fast/)
  assert.match(pollinations, /method: 'GET'/)
  assert.doesNotMatch(pollinations, /authorization|OPENAI_API_KEY/i)
})
