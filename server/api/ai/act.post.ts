import { createError, readBody } from 'h3'
import { isAuthDatabaseConfigured } from '../../utils/authStorage'
import { readOAuthSession } from '../../utils/oauth'
import { enforceRateLimit } from '../../utils/rateLimit'
import { buildAiContext } from '../../../utils/ai/context'
import { runAiAgent } from '../../utils/aiLlm'

function asRequestText(value: unknown) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, 2000)
}

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'ai-act', 20, 15 * 60 * 1000)
  const session = readOAuthSession(event)
  if (isAuthDatabaseConfigured() && !session) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }

  const config = useRuntimeConfig()
  const body = ((await readBody(event).catch(() => null)) ?? {}) as Record<
    string,
    unknown
  >
  const request = asRequestText(body.request)
  if (request.length < 2) {
    throw createError({ statusCode: 400, statusMessage: 'Request is required' })
  }

  let context
  try {
    context = buildAiContext(body.context)
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error instanceof Error ? error.message : 'Invalid AI context',
    })
  }

  return runAiAgent({
    request,
    context,
    engine: String(config.aiEngine || 'openai'),
    apiKey: String(config.openaiApiKey || '').trim(),
    model: String(config.openaiModel || 'minimax/minimax-m2.7:free'),
    baseUrl: String(config.openaiBaseUrl || 'https://openrouter.ai/api/v1'),
    siteUrl: String(config.public.webAppUrl || 'https://cof-board.com'),
  })
})
