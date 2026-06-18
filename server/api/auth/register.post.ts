import { readBody } from 'h3'
import { createPendingRegistration, isAuthDatabaseConfigured } from '../../utils/authStorage'
import { verifyCaptcha } from '../../utils/captcha'
import { enforceRateLimit } from '../../utils/rateLimit'
import { sendMail } from '../../utils/smtp'
import { hasActiveSubscription } from '../../utils/subscriptionStorage'

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'register', 5, 15 * 60 * 1000)
  if (!isAuthDatabaseConfigured()) {
    throw createError({ statusCode: 503, statusMessage: 'Cloud accounts are not configured' })
  }

  const body = await readBody<Record<string, unknown>>(event)
  const email = typeof body?.email === 'string' ? body.email.trim() : ''
  const password = typeof body?.password === 'string' ? body.password : ''
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  const acceptedTerms = body?.acceptedTerms === true
  const termsVersion = body?.termsVersion === '2026-06-07' ? body.termsVersion : ''

  if (!verifyCaptcha(body?.captchaToken, body?.captchaAnswer)) {
    throw createError({ statusCode: 400, statusMessage: 'Captcha verification failed' })
  }
  if (!email.includes('@') || password.length < 8 || name.length < 2) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid registration data' })
  }
  if (!acceptedTerms || !termsVersion) {
    throw createError({ statusCode: 400, statusMessage: 'Terms consent is required' })
  }
  if (!(await hasActiveSubscription(email))) {
    throw createError({ statusCode: 402, statusMessage: 'Active subscription is required' })
  }

  try {
    const verification = await createPendingRegistration(email, password, name, termsVersion)
    const sent = await sendMail({
      to: verification.email,
      subject: 'Код подтверждения Core of Life',
      text: [
        `${verification.name}, здравствуйте.`,
        '',
        'Введите этот код в Core of Life, чтобы подтвердить email:',
        '',
        verification.code,
        '',
        'Код действует 15 минут. Если это были не вы, просто проигнорируйте письмо.',
        '',
        'Core of Life',
      ].join('\n'),
    })

    return { requiresVerification: true, email: verification.email, sent }
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'statusCode' in error) throw error
    throw createError({ statusCode: 503, statusMessage: 'Account database is unavailable' })
  }
})
