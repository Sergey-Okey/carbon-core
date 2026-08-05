import { readBody } from 'h3'
import { createPendingRegistration, isAuthDatabaseConfigured } from '../../utils/authStorage'
import { enforceRateLimit } from '../../utils/rateLimit'
import { sendMail } from '../../utils/smtp'
import { validateEmail } from '../../../utils/authValidation'

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'register', 5, 15 * 60 * 1000)
  if (!isAuthDatabaseConfigured()) {
    throw createError({ statusCode: 503, statusMessage: 'Cloud accounts are not configured' })
  }

  const body = await readBody<Record<string, unknown>>(event)
  const email = typeof body?.email === 'string' ? body.email.trim() : ''
  const acceptedTerms = body?.acceptedTerms === true
  const termsVersion = body?.termsVersion === '2026-06-07' ? body.termsVersion : ''

  if (validateEmail(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid registration data' })
  }
  if (!acceptedTerms || !termsVersion) {
    throw createError({ statusCode: 400, statusMessage: 'Terms consent is required' })
  }

  try {
    const verification = await createPendingRegistration(email, termsVersion)
    const sent = await sendMail({
      to: verification.email,
      subject: 'Код подтверждения Core of Life',
      text: [
        'Здравствуйте.',
        '',
        'Чтобы завершить регистрацию в Core of Life:',
        '1) введите этот код в приложении,',
        '2) задайте пароль для входа.',
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
