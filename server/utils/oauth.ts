import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import { deleteCookie, getCookie, getRequestURL, setCookie } from 'h3'

export type OAuthProvider = 'google' | 'yandex'
export type AuthProvider = OAuthProvider | 'local'

export type OAuthProfile = {
  id: string
  email: string
  name: string
  avatar: string
  provider: AuthProvider
  createdAt?: string
}

const stateCookie = 'cof_oauth_state'
const sessionCookie = 'cof_auth_session'

function getProviderCredentials(provider: OAuthProvider) {
  const config = useRuntimeConfig()
  return provider === 'google'
    ? { clientId: config.googleClientId.trim(), clientSecret: config.googleClientSecret.trim() }
    : { clientId: config.yandexClientId.trim(), clientSecret: config.yandexClientSecret.trim() }
}

export function isOAuthProvider(value: unknown): value is OAuthProvider {
  return value === 'google' || value === 'yandex'
}

export function getOAuthProviders() {
  const config = useRuntimeConfig()
  const hasSessionSecret = config.authSessionSecret.trim().length >= 32
  return {
    google: hasSessionSecret && Boolean(config.googleClientId && config.googleClientSecret),
    yandex: hasSessionSecret && Boolean(config.yandexClientId && config.yandexClientSecret),
  }
}

function getCallbackUrl(event: H3Event, provider: OAuthProvider) {
  const configuredOrigin = useRuntimeConfig().public.webAppUrl.trim().replace(/\/$/, '')
  const origin = configuredOrigin || getRequestURL(event).origin
  return `${origin}/api/auth/${provider}/callback`
}

export function createAuthorizationUrl(event: H3Event, provider: OAuthProvider) {
  const credentials = getProviderCredentials(provider)
  if (!credentials.clientId || !credentials.clientSecret || !getOAuthProviders()[provider]) {
    throw createError({ statusCode: 503, statusMessage: 'OAuth provider is not configured' })
  }

  const state = randomBytes(32).toString('hex')
  setCookie(event, stateCookie, `${provider}:${state}`, cookieOptions(event, 600))
  const callbackUrl = getCallbackUrl(event, provider)

  if (provider === 'google') {
    return `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: credentials.clientId,
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      prompt: 'select_account',
    })}`
  }

  return `https://oauth.yandex.ru/authorize?${new URLSearchParams({
    client_id: credentials.clientId,
    redirect_uri: callbackUrl,
    response_type: 'code',
    state,
  })}`
}

export function validateOAuthState(event: H3Event, provider: OAuthProvider, state: string) {
  const expected = getCookie(event, stateCookie)
  deleteCookie(event, stateCookie, cookieOptions(event, 0))
  if (!expected || expected !== `${provider}:${state}`) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid OAuth state' })
  }
}

export async function exchangeOAuthCode(
  event: H3Event,
  provider: OAuthProvider,
  code: string
): Promise<OAuthProfile> {
  const credentials = getProviderCredentials(provider)
  const callbackUrl = getCallbackUrl(event, provider)
  const tokenUrl =
    provider === 'google' ? 'https://oauth2.googleapis.com/token' : 'https://oauth.yandex.ru/token'
  const tokenResponse = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: callbackUrl,
    }),
  })
  if (!tokenResponse.ok) throw createError({ statusCode: 401, statusMessage: 'OAuth exchange failed' })

  const token = (await tokenResponse.json()) as { access_token?: string }
  if (!token.access_token) throw createError({ statusCode: 401, statusMessage: 'OAuth token missing' })

  if (provider === 'google') {
    const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { authorization: `Bearer ${token.access_token}` },
    })
    const profile = (await response.json()) as {
      sub?: string
      email?: string
      name?: string
      picture?: string
    }
    return normalizeProfile(provider, profile.sub, profile.email, profile.name, profile.picture)
  }

  const response = await fetch('https://login.yandex.ru/info?format=json', {
    headers: { authorization: `OAuth ${token.access_token}` },
  })
  const profile = (await response.json()) as {
    id?: string
    default_email?: string
    real_name?: string
    display_name?: string
    default_avatar_id?: string
  }
  const avatar = profile.default_avatar_id
    ? `https://avatars.yandex.net/get-yapic/${profile.default_avatar_id}/islands-200`
    : ''
  return normalizeProfile(
    provider,
    profile.id,
    profile.default_email,
    profile.real_name || profile.display_name,
    avatar
  )
}

function normalizeProfile(
  provider: OAuthProvider,
  id?: string,
  email?: string,
  name?: string,
  avatar?: string
): OAuthProfile {
  if (!id || !email) throw createError({ statusCode: 401, statusMessage: 'OAuth profile incomplete' })
  return { id: `${provider}:${id}`, email, name: name || email.split('@')[0], avatar: avatar || '', provider }
}

export function setOAuthSession(event: H3Event, profile: OAuthProfile) {
  const sessionProfile = {
    ...profile,
    avatar: profile.avatar.length <= 1024 ? profile.avatar : '',
  }
  const payload = Buffer.from(JSON.stringify(sessionProfile)).toString('base64url')
  const signature = sign(payload)
  setCookie(event, sessionCookie, `${payload}.${signature}`, cookieOptions(event, 60 * 60 * 24 * 30))
}

export function readOAuthSession(event: H3Event): OAuthProfile | null {
  if (useRuntimeConfig().authSessionSecret.trim().length < 32) return null
  const raw = getCookie(event, sessionCookie)
  if (!raw) return null
  const [payload, signature] = raw.split('.')
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return null
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as OAuthProfile
  } catch {
    return null
  }
}

export function clearOAuthSession(event: H3Event) {
  deleteCookie(event, sessionCookie, cookieOptions(event, 0))
}

function sign(payload: string) {
  const secret = useRuntimeConfig().authSessionSecret.trim()
  if (secret.length < 32) {
    throw createError({ statusCode: 503, statusMessage: 'Session secret is not configured' })
  }
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

function cookieOptions(event: H3Event, maxAge: number) {
  const secure = getRequestURL(event).protocol === 'https:'
  return {
    httpOnly: true,
    sameSite: secure ? ('none' as const) : ('lax' as const),
    secure,
    path: '/',
    maxAge,
  }
}
