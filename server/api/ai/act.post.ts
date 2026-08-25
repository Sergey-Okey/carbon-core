import { createError, readBody } from 'h3'
import { enforceRateLimit } from '../../utils/rateLimit'
import { buildAiContext } from '../../../utils/ai/context'
import { resolveAiApiKey, runAiAgent } from '../../utils/aiLlm'

function asRequestText(value: unknown) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, 2000)
}

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'ai-act', 20, 15 * 60 * 1000)

  const config = useRuntimeConfig()
  const body = ((await readBody(event).catch(() => null)) ?? {}) as Record<
    string,
    unknown
  >
  const request = asRequestText(body.request)
  if (request.length < 2) {
    throw createError({ statusCode: 400, statusMessage: 'Request is required' })
  }

  const context = buildAiContext(body.context)

  return runAiAgent({
    request,
    context,
    engine: String(config.aiEngine || process.env.NUXT_AI_ENGINE || process.env.AI_ENGINE || 'openai'),
    apiKey: resolveAiApiKey(config.openaiApiKey),
    model: String(
      config.openaiModel || process.env.NUXT_OPENAI_MODEL || process.env.OPENAI_MODEL || 'minimax/minimax-m2.7:free'
    ),
    baseUrl: String(
      config.openaiBaseUrl ||
        process.env.NUXT_OPENAI_BASE_URL ||
        process.env.OPENAI_BASE_URL ||
        'https://openrouter.ai/api/v1'
    ),
    siteUrl: String(config.public.webAppUrl || process.env.NUXT_PUBLIC_WEB_APP_URL || 'https://cof-board.com'),
  })
})
