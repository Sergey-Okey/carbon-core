import { createError } from 'h3'
import type { AiActResponse, AiContext, AiOperation } from '../../types/ai.types'
import { compactAiContext } from '../../utils/ai/context'
import { parseAiTextResponse } from '../../utils/ai/operations'
import { detectIntent, runLocalAgent } from '../../utils/ai/localAgent'
import { runPollinationsAgent } from '../../utils/ai/pollinations'
import { AI_PROMPT_EXAMPLES, AI_SYSTEM_PROMPT } from '../../utils/ai/prompt'

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
const OPENROUTER_MODEL = 'minimax/minimax-m2.7:free'
const OPENROUTER_FALLBACKS = [
  'google/gemma-4-31b-it:free',
  'z-ai/glm-5.2:free',
  'nvidia/nemotron-3.5-lightning:free',
]
// Board-sized prompts take 3-12 s on the configured model, so the window keeps a margin.
const CLOUD_TIMEOUT_MS = 22000
const OPENROUTER_TIMEOUT_MS = 22000
const OPENROUTER_BLOCKED = 'OPENROUTER_BLOCKED'

type Fetcher = typeof fetch

function mutatesWorkspace(operations: AiOperation[]) {
  return operations.some((item) => item.op !== 'updateSettings')
}

function isReadOnlyIntent(request: string) {
  const kind = detectIntent(request).kind
  return kind === 'help' || kind === 'briefing' || kind === 'inspect'
}

function acceptCloudPlan(request: string, cloud: AiActResponse): AiActResponse {
  if (isReadOnlyIntent(request) && mutatesWorkspace(cloud.operations)) {
    return { message: cloud.message, operations: [] }
  }
  return cloud
}

function isPollinationsEngine(engine?: string) {
  return String(engine || '').toLowerCase() === 'pollinations'
}

export function isOpenRouterSecurityBlock(status: number, details: string) {
  if (status !== 403) return false
  return /access denied by security policy|sorry, you have been blocked/i.test(details)
}

function isOpenRouterBlockedError(error: unknown) {
  if (
    error &&
    typeof error === 'object' &&
    (error as { code?: string }).code === OPENROUTER_BLOCKED
  ) {
    return true
  }
  if (!(error instanceof Error)) return false
  return (
    error.name === 'TimeoutError' ||
    error.name === 'AbortError' ||
    /aborted due to timeout|fetch failed|ECONNRESET|ETIMEDOUT/i.test(error.message)
  )
}

async function runPollinationsCloud(
  request: string,
  context: AiContext,
  options: { fetcher?: Fetcher; siteUrl?: string }
) {
  try {
    return acceptCloudPlan(
      request,
      await runPollinationsAgent(request, context, {
        fetcher: options.fetcher,
        timeoutMs: CLOUD_TIMEOUT_MS,
        siteUrl: options.siteUrl,
      })
    )
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: 'Не получилось ответить. Попробуйте ещё раз.',
    })
  }
}

function isOpenRouterHop(baseUrl: string) {
  const url = String(baseUrl || '').toLowerCase()
  return (
    url.includes('openrouter.ai') ||
    url.includes('or.cof-board.com') ||
    url.includes('workers.dev') ||
    url.includes('openrouter-proxy')
  )
}

function extractChatContent(payload: {
  choices?: {
    message?: {
      content?: string | Array<{ text?: string; type?: string }>
      reasoning_content?: string
    }
  }[]
}) {
  const message = payload.choices?.[0]?.message
  const raw = message?.content
  if (typeof raw === 'string' && raw.trim()) return raw
  if (Array.isArray(raw)) {
    const text = raw
      .map((part) => (typeof part === 'string' ? part : String(part?.text || '')))
      .join('')
    if (text.trim()) return text
  }
  return ''
}

async function runCloudAgent(input: {
  request: string
  context: AiContext
  apiKey: string
  model: string
  baseUrl: string
  siteUrl?: string
  proxySecret?: string
  fetcher?: Fetcher
}): Promise<AiActResponse> {
  const endpoint = `${input.baseUrl.replace(/\/$/, '')}/chat/completions`
  const proxySecret = String(input.proxySecret || '').trim()
  const viaProxy = Boolean(proxySecret)
  const viaOpenRouter = isOpenRouterHop(input.baseUrl)
  const headers: Record<string, string> = {
    authorization: `Bearer ${input.apiKey}`,
    'content-type': 'application/json',
  }
  if (viaProxy && viaOpenRouter) {
    headers['x-cof-proxy-secret'] = proxySecret
  }
  if (viaOpenRouter) {
    headers['HTTP-Referer'] = input.siteUrl || 'https://cof-board.com'
    headers['X-Title'] = 'Core of Life'
  }

  const body: Record<string, unknown> = {
    model: input.model,
    temperature: 0.2,
    messages: [
      { role: 'system', content: `${AI_SYSTEM_PROMPT}\n${AI_PROMPT_EXAMPLES}` },
      {
        role: 'user',
        content: JSON.stringify({
          request: input.request,
          context: compactAiContext(input.context),
        }),
      },
    ],
  }
  if (viaOpenRouter) {
    body.models = OPENROUTER_FALLBACKS.filter((item) => item !== input.model)
  }
  if (!input.model.includes(':free') && input.model !== 'openrouter/free') {
    body.response_format = { type: 'json_object' }
  }

  const fetcher = input.fetcher || fetch
  const response = await fetcher(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(OPENROUTER_TIMEOUT_MS),
  })

  if (!response.ok) {
    const details = await response.text().catch(() => '')
    if (isOpenRouterSecurityBlock(response.status, details)) {
      throw Object.assign(new Error(OPENROUTER_BLOCKED), { code: OPENROUTER_BLOCKED })
    }
    throw createError({
      statusCode: 502,
      statusMessage: 'Не получилось ответить. Попробуйте ещё раз.',
    })
  }

  const payload = (await response.json()) as Parameters<typeof extractChatContent>[0]
  const content = extractChatContent(payload)
  if (!content) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Не получилось ответить. Попробуйте ещё раз.',
    })
  }

  return parseAiTextResponse(content)
}

export function resolveOpenRouterProxySecret(configured?: string) {
  return String(configured || process.env.OPENROUTER_PROXY_SECRET || '').trim()
}

export function resolveAiBaseUrl(configured?: string) {
  return String(
    process.env.NUXT_OPENAI_BASE_URL ||
      process.env.OPENAI_BASE_URL ||
      process.env.OPENROUTER_PROXY_URL ||
      configured ||
      OPENROUTER_BASE_URL
  ).trim()
}

export function resolveAiApiKey(configured?: string) {
  return String(
    configured ||
      process.env.NUXT_OPENAI_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.OPENROUTER_API_KEY ||
      ''
  ).trim()
}

export async function runAiAgent(input: {
  request: string
  context: AiContext
  engine?: string
  apiKey?: string
  model?: string
  baseUrl?: string
  siteUrl?: string
  proxySecret?: string
  fetcher?: Fetcher
}): Promise<AiActResponse> {
  const intent = detectIntent(input.request)
  if (intent.kind === 'help') {
    return runLocalAgent(input.request, input.context)
  }

  if (isPollinationsEngine(input.engine)) {
    try {
      return await runPollinationsCloud(input.request, input.context, {
        fetcher: input.fetcher,
        siteUrl: input.siteUrl,
      })
    } catch {
      return runLocalAgent(input.request, input.context)
    }
  }

  const apiKey = resolveAiApiKey(input.apiKey)
  if (!apiKey) {
    return runLocalAgent(input.request, input.context)
  }

  try {
    const cloud = await runCloudAgent({
      request: input.request,
      context: input.context,
      apiKey,
      model: input.model || OPENROUTER_MODEL,
      baseUrl: resolveAiBaseUrl(input.baseUrl),
      siteUrl: input.siteUrl,
      proxySecret: resolveOpenRouterProxySecret(input.proxySecret),
      fetcher: input.fetcher,
    })
    return acceptCloudPlan(input.request, cloud)
  } catch (error) {
    if (isOpenRouterBlockedError(error)) {
      try {
        return await runPollinationsCloud(input.request, input.context, {
          fetcher: input.fetcher,
          siteUrl: input.siteUrl,
        })
      } catch {
        return runLocalAgent(input.request, input.context)
      }
    }
    return runLocalAgent(input.request, input.context)
  }
}
