import type { H3Event } from 'h3'
import { getRequestIP } from 'h3'

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const VERIFY_TIMEOUT_MS = 8000

type RuntimeTurnstileConfig = {
  turnstileSecretKey?: string
  public?: { turnstileSiteKey?: string }
}

function getSecretKey() {
  const config = useRuntimeConfig() as unknown as RuntimeTurnstileConfig
  return (config.turnstileSecretKey || process.env.TURNSTILE_SECRET_KEY || '').trim()
}

function getSiteKey() {
  const config = useRuntimeConfig() as unknown as RuntimeTurnstileConfig
  return (config.public?.turnstileSiteKey || process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY || '').trim()
}

export function isTurnstileConfigured() {
  return Boolean(getSecretKey() && getSiteKey())
}

async function siteVerify(secret: string, token: string, remoteIp: string) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS)
  try {
    const response = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        secret,
        response: token,
        ...(remoteIp ? { remoteip: remoteIp } : {}),
      }),
      signal: controller.signal,
    })
    if (!response.ok) return { ok: false, codes: [`http-${response.status}`] }
    const payload = (await response.json()) as {
      success?: boolean
      'error-codes'?: string[]
    }
    return { ok: payload.success === true, codes: payload['error-codes'] || [] }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Blocks the request when the Turnstile token is missing or rejected.
 * Skipped entirely while keys are unset so self-hosted setups keep working.
 */
export async function assertHuman(event: H3Event, token: unknown) {
  const secret = getSecretKey()
  if (!secret || !getSiteKey()) return

  const candidate = typeof token === 'string' ? token.trim() : ''
  if (!candidate || candidate.length > 2048) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Подтвердите, что вы не робот',
    })
  }

  const remoteIp = getRequestIP(event, { xForwardedFor: true }) || ''
  let result: { ok: boolean; codes: string[] }
  try {
    result = await siteVerify(secret, candidate, remoteIp)
  } catch (error) {
    console.error('[turnstile] verification unavailable', error)
    throw createError({
      statusCode: 503,
      statusMessage: 'Проверка не прошла. Обновите страницу и попробуйте снова',
    })
  }

  if (result.ok) return

  console.warn('[turnstile] rejected', result.codes.join(','))
  throw createError({
    statusCode: 400,
    statusMessage: 'Проверка не прошла. Обновите страницу и попробуйте снова',
  })
}
