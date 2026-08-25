import { createError, readBody } from 'h3'
import { enforceRateLimit } from '../../utils/rateLimit'
import { buildAiContext } from '../../../utils/ai/context'
import {
  resolveAiApiKey,
  resolveAiBaseUrl,
  resolveOpenRouterProxySecret,
  runAiAgent,
} from '../../utils/aiLlm'

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
    engine: String(process.env.NUXT_AI_ENGINE || process.env.AI_ENGINE || config.aiEngine || 'openai'),
    apiKey: resolveAiApiKey(
      process.env.NUXT_OPENAI_API_KEY || process.env.OPENAI_API_KEY || config.openaiApiKey
    ),
    model: String(
      process.env.NUXT_OPENAI_MODEL ||
        process.env.OPENAI_MODEL ||
        config.openaiModel ||
        'minimax/minimax-m2.7:free'
    ),
    baseUrl: resolveAiBaseUrl(config.openaiBaseUrl),
    siteUrl: String(config.public.webAppUrl || process.env.NUXT_PUBLIC_WEB_APP_URL || 'https://cof-board.com'),
    proxySecret: resolveOpenRouterProxySecret(config.openrouterProxySecret),
  })
})
