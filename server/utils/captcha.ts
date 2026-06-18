import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

type CaptchaPayload = {
  answer: number
  expiresAt: number
  nonce: string
}

function getCaptchaSecret() {
  const config = useRuntimeConfig() as unknown as { authSessionSecret?: string }
  return config.authSessionSecret?.trim() || process.env.AUTH_SESSION_SECRET || 'local-captcha-secret'
}

function encodePayload(payload: CaptchaPayload) {
  return Buffer.from(JSON.stringify(payload)).toString('base64url')
}

function signPayload(payload: string) {
  return createHmac('sha256', getCaptchaSecret()).update(payload).digest('base64url')
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

export function createCaptchaChallenge() {
  const left = 2 + randomBytes(1)[0] % 8
  const right = 2 + randomBytes(1)[0] % 8
  const payload = encodePayload({
    answer: left + right,
    expiresAt: Date.now() + 10 * 60 * 1000,
    nonce: randomBytes(12).toString('hex'),
  })
  return {
    question: `${left} + ${right}`,
    token: `${payload}.${signPayload(payload)}`,
  }
}

export function verifyCaptcha(token: unknown, answer: unknown) {
  if (typeof token !== 'string' || typeof answer !== 'string') return false
  const [payload, signature] = token.split('.')
  if (!payload || !signature || !safeEqual(signature, signPayload(payload))) return false
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as CaptchaPayload
    if (!Number.isFinite(parsed.answer) || parsed.expiresAt < Date.now()) return false
    return String(parsed.answer) === answer.trim()
  } catch {
    return false
  }
}
