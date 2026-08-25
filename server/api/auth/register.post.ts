import { readBody } from 'h3'
import { createPendingRegistration, isAuthDatabaseConfigured } from '../../utils/authStorage'
import { enforceRateLimit } from '../../utils/rateLimit'
import { isMailConfigured, sendMail } from '../../utils/smtp'
import { assertHuman } from '../../utils/turnstile'
import {
  normalizePhone,
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
} from '../../../utils/authValidation'

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'register', 5, 15 * 60 * 1000)
  if (!isAuthDatabaseConfigured()) {
    throw createError({ statusCode: 503, statusMessage: 'Cloud accounts are not configured' })
  }
  if (!isMailConfigured()) {
    throw createError({ statusCode: 503, statusMessage: 'Email delivery is not configured' })
  }

  const body = await readBody<Record<string, unknown>>(event)
  await assertHuman(event, body?.turnstileToken)
  const email = typeof body?.email === 'string' ? body.email.trim() : ''
  const password = typeof body?.password === 'string' ? body.password : ''
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  const phone = typeof body?.phone === 'string' ? normalizePhone(body.phone) : ''
  const acceptedTerms = body?.acceptedTerms === true
  const termsVersion = body?.termsVersion === '2026-06-07' ? body.termsVersion : ''

  if (
    validateName(name) ||
    validateEmail(email) ||
    validatePhone(phone) ||
    validatePassword(password)
  ) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid registration data' })
  }
  if (!acceptedTerms || !termsVersion) {
    throw createError({ statusCode: 400, statusMessage: 'Terms consent is required' })
  }

  try {
    const verification = await createPendingRegistration(
      email,
      password,
      name,
      termsVersion,
      phone
    )
    let sent = false
    try {
      sent = await sendMail({
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
    } catch (error) {
      console.error('[auth] verification mail failed', error)
      sent = false
    }

    return { requiresVerification: true, email: verification.email, sent }
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'statusCode' in error) throw error
    throw createError({ statusCode: 503, statusMessage: 'Account database is unavailable' })
  }
})
