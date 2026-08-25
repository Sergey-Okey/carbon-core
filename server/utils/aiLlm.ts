import { createError } from 'h3'
import type { AiActResponse, AiContext, AiOperation } from '../../types/ai.types'
import { compactAiContext } from '../../utils/ai/context'
import { parseAiTextResponse } from '../../utils/ai/operations'
import { detectIntent, runLocalAgent } from '../../utils/ai/localAgent'
import { POLLINATIONS_ANON_MODEL, runPollinationsAgent } from '../../utils/ai/pollinations'
import { AI_PROMPT_EXAMPLES, AI_SYSTEM_PROMPT } from '../../utils/ai/prompt'

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
const OPENROUTER_MODEL = 'minimax/minimax-m2.7:free'
const OPENROUTER_FALLBACKS = [
  'google/gemma-4-31b-it:free',
  'z-ai/glm-5.2:free',
  'nvidia/nemotron-3.5-lightning:free',
]
const CLOUD_TIMEOUT_MS = 18000

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

async function runCloudAgent(input: {
  request: string
  context: AiContext
  apiKey: string
  model: string
  baseUrl: string
  siteUrl?: string
}): Promise<AiActResponse> {
  const endpoint = `${input.baseUrl.replace(/\/$/, '')}/chat/completions`
  const headers: Record<string, string> = {
    authorization: `Bearer ${input.apiKey}`,
    'content-type': 'application/json',
  }
  if (input.baseUrl.includes('openrouter.ai')) {
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
  if (input.baseUrl.includes('openrouter.ai')) {
    body.models = OPENROUTER_FALLBACKS.filter((item) => item !== input.model)
  }
  if (!input.model.includes(':free') && input.model !== 'openrouter/free') {
    body.response_format = { type: 'json_object' }
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(CLOUD_TIMEOUT_MS),
  })

  if (!response.ok) {
    const details = await response.text().catch(() => '')
    throw createError({
      statusCode: 502,
      statusMessage: details.slice(0, 180) || 'AI provider request failed',
    })
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const content = payload.choices?.[0]?.message?.content
  if (!content) {
    throw createError({ statusCode: 502, statusMessage: 'Empty AI response' })
  }

  return parseAiTextResponse(content)
}

function isOpenAiCompatible(engine: string) {
  return engine === 'openai' || engine === 'openrouter'
}

export async function runAiAgent(input: {
  request: string
  context: AiContext
  engine?: string
  apiKey?: string
  model?: string
  baseUrl?: string
  siteUrl?: string
}): Promise<AiActResponse> {
  const engine = String(input.engine || 'openai').toLowerCase()
  const local = () => runLocalAgent(input.request, input.context)

  if (engine === 'local') return local()

  if (isOpenAiCompatible(engine) && input.apiKey) {
    try {
      const cloud = await runCloudAgent({
        request: input.request,
        context: input.context,
        apiKey: input.apiKey,
        model: input.model || OPENROUTER_MODEL,
        baseUrl: input.baseUrl || OPENROUTER_BASE_URL,
        siteUrl: input.siteUrl,
      })
      return acceptCloudPlan(input.request, cloud)
    } catch {
      return local()
    }
  }

  if (engine === 'pollinations') {
    try {
      const cloud = await Promise.race([
        runPollinationsAgent(input.request, input.context, {
          model: input.model || POLLINATIONS_ANON_MODEL,
        }),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Pollinations timeout')), 2500)
        }),
      ])
      return acceptCloudPlan(input.request, cloud)
    } catch {
      return local()
    }
  }

  return local()
}
