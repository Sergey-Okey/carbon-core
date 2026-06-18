import { readBody } from 'h3'
import { createEmailVerificationCode, isAuthDatabaseConfigured } from '../../../utils/authStorage'
import { verifyCaptcha } from '../../../utils/captcha'
import { enforceRateLimit } from '../../../utils/rateLimit'
import { sendMail } from '../../../utils/smtp'

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'email-verification-resend', 5, 15 * 60 * 1000)
  if (!isAuthDatabaseConfigured()) {
    throw createError({ statusCode: 503, statusMessage: 'Cloud accounts are not configured' })
  }

  const body = await readBody<Record<string, unknown>>(event)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!verifyCaptcha(body?.captchaToken, body?.captchaAnswer)) {
    throw createError({ statusCode: 400, statusMessage: 'Captcha verification failed' })
  }
  if (!email.includes('@')) throw createError({ statusCode: 400, statusMessage: 'Email is required' })

  const verification = await createEmailVerificationCode(email)
  if (!verification) return { ok: true, sent: false }

  const sent = await sendMail({
    to: verification.email,
    subject: 'Новый код подтверждения Core of Life',
    text: [
      `${verification.name}, здравствуйте.`,
      '',
      'Ваш новый код подтверждения email:',
      '',
      verification.code,
      '',
      'Код действует 15 минут.',
      '',
      'Core of Life',
    ].join('\n'),
  })

  return { ok: true, sent }
})
