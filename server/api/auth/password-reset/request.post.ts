import { getRequestURL, readBody } from 'h3'
import { createPasswordResetToken, isAuthDatabaseConfigured } from '../../../utils/authStorage'
import { verifyCaptcha } from '../../../utils/captcha'
import { enforceRateLimit } from '../../../utils/rateLimit'
import { sendMail } from '../../../utils/smtp'

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'password-reset-request', 5, 15 * 60 * 1000)
  if (!isAuthDatabaseConfigured()) {
    throw createError({ statusCode: 503, statusMessage: 'Cloud accounts are not configured' })
  }

  const body = await readBody<Record<string, unknown>>(event)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!verifyCaptcha(body?.captchaToken, body?.captchaAnswer)) {
    throw createError({ statusCode: 400, statusMessage: 'Captcha verification failed' })
  }
  if (!email.includes('@')) throw createError({ statusCode: 400, statusMessage: 'Email is required' })

  const reset = await createPasswordResetToken(email)
  if (!reset) return { ok: true, sent: false }

  const origin = useRuntimeConfig().public.webAppUrl.trim().replace(/\/$/, '')
  const resetUrl = `${origin || getRequestURL(event).origin}/auth?resetToken=${encodeURIComponent(reset.token)}`
  const sent = await sendMail({
    to: reset.email,
    subject: 'Восстановление пароля Core of Life',
    text: [
      `${reset.name}, здравствуйте.`,
      '',
      'Вы запросили восстановление пароля в Core of Life.',
      `Ссылка действует 30 минут: ${resetUrl}`,
      '',
      'Если это были не вы, просто проигнорируйте письмо.',
      '',
      'Берегите фокус и свой ритм.',
      'Core of Life',
    ].join('\n'),
  })

  return { ok: true, sent }
})
