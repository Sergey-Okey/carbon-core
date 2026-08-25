import type { AiActResponse, AiContext } from '../../types/ai.types.ts'
import { compactAiContext } from './context.ts'
import { parseAiTextResponse } from './operations.ts'
import { AI_PROMPT_EXAMPLES, AI_SYSTEM_PROMPT } from './prompt.ts'

export const POLLINATIONS_ORIGIN = 'https://text.pollinations.ai'
export const POLLINATIONS_OPENAI_URL = `${POLLINATIONS_ORIGIN}/openai`
export const POLLINATIONS_ANON_MODEL = 'openai-fast'
export const POLLINATIONS_MAX_URL_LENGTH = 7500
export const POLLINATIONS_TIMEOUT_MS = 4_000

type Fetcher = typeof fetch

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function buildPollinationsGetUrl(
  prompt: string,
  model = POLLINATIONS_ANON_MODEL
) {
  return `${POLLINATIONS_ORIGIN}/${encodeURIComponent(prompt)}?model=${encodeURIComponent(model)}`
}

export function buildPollinationsPrompt(
  request: string,
  context: AiContext,
  maxUrlLength = POLLINATIONS_MAX_URL_LENGTH
) {
  const stages = [
    { tasks: 36, branches: 16, memory: 4 },
    { tasks: 20, branches: 8, memory: 2 },
    { tasks: 8, branches: 4, memory: 0 },
    { tasks: 4, branches: 2, memory: 0 },
  ] as const

  let prompt = ''
  for (const limits of stages) {
    prompt = [
      AI_SYSTEM_PROMPT,
      AI_PROMPT_EXAMPLES,
      `Запрос: ${request.slice(0, 2000)}`,
      `Контекст: ${JSON.stringify(compactAiContext(context, limits))}`,
    ].join('\n')
    if (buildPollinationsGetUrl(prompt).length <= maxUrlLength) return prompt
  }

  return [
    AI_SYSTEM_PROMPT,
    `Запрос: ${request.slice(0, 800)}`,
    `Контекст: ${JSON.stringify({ today: context.today, slots: context.slots })}`,
  ].join('\n')
}

export function isPollinationsFailurePayload(text: string) {
  const trimmed = text.trim()
  if (!trimmed) return true
  if (/^<!doctype html/i.test(trimmed) || /<html[\s>]/i.test(trimmed)) return true
  try {
    const parsed = JSON.parse(trimmed) as unknown
    if (!isRecord(parsed)) return false
    const status = Number(parsed.status || parsed.statusCode || 0)
    if (status >= 400) return true
    if (typeof parsed.error === 'string' && /payment|unauthorized|forbidden|rate/i.test(parsed.error)) {
      return true
    }
  } catch {
    return false
  }
  return false
}

function contentFromOpenAiPayload(payload: unknown) {
  if (!isRecord(payload)) return ''
  const choices = Array.isArray(payload.choices) ? payload.choices : []
  const first = isRecord(choices[0]) ? choices[0] : null
  const message = first && isRecord(first.message) ? first.message : null
  return typeof message?.content === 'string' ? message.content : ''
}

async function runPollinationsPost(
  request: string,
  context: AiContext,
  options: { model?: string; fetcher?: Fetcher; timeoutMs?: number }
) {
  const compact = compactAiContext(context, { tasks: 24, branches: 10, memory: 3 })
  const fetcher = options.fetcher || fetch
  const timeoutMs = options.timeoutMs ?? POLLINATIONS_TIMEOUT_MS
  const response = await fetcher(POLLINATIONS_OPENAI_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json, text/plain',
      'content-type': 'application/json',
      'user-agent': 'Mozilla/5.0 (compatible; CoreOfLife/1.0)',
    },
    body: JSON.stringify({
      model: options.model || POLLINATIONS_ANON_MODEL,
      jsonMode: true,
      messages: [
        { role: 'system', content: `${AI_SYSTEM_PROMPT}\n${AI_PROMPT_EXAMPLES}` },
        {
          role: 'user',
          content: `Запрос: ${request.slice(0, 2000)}\nКонтекст: ${JSON.stringify(compact)}`,
        },
      ],
    }),
    signal: AbortSignal.timeout(timeoutMs),
  })
  const text = await response.text()
  if (!response.ok || isPollinationsFailurePayload(text)) {
    throw new Error(`Pollinations POST failed (${response.status}): ${text.slice(0, 180) || 'empty'}`)
  }
  let content = text
  try {
    content = contentFromOpenAiPayload(JSON.parse(text) as unknown) || text
  } catch {
    content = text
  }
  return parseAiTextResponse(content)
}

async function runPollinationsGet(
  request: string,
  context: AiContext,
  options: { model?: string; fetcher?: Fetcher; timeoutMs?: number }
) {
  const prompt = buildPollinationsPrompt(request, context)
  const url = buildPollinationsGetUrl(prompt, options.model || POLLINATIONS_ANON_MODEL)
  const fetcher = options.fetcher || fetch
  const timeoutMs = options.timeoutMs ?? POLLINATIONS_TIMEOUT_MS
  const response = await fetcher(url, {
    method: 'GET',
    headers: {
      accept: 'text/plain, application/json',
      'user-agent': 'Mozilla/5.0 (compatible; CoreOfLife/1.0)',
    },
    signal: AbortSignal.timeout(timeoutMs),
  })
  const text = await response.text()
  if (!response.ok || isPollinationsFailurePayload(text)) {
    throw new Error(
      `Pollinations request failed (${response.status}): ${text.slice(0, 180) || 'empty'}`
    )
  }
  return parseAiTextResponse(text)
}

export async function runPollinationsAgent(
  request: string,
  context: AiContext,
  options: { model?: string; fetcher?: Fetcher; timeoutMs?: number } = {}
): Promise<AiActResponse> {
  try {
    return await runPollinationsPost(request, context, options)
  } catch {
    return runPollinationsGet(request, context, options)
  }
}
