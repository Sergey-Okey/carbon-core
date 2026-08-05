import { readBody } from 'h3'
import { isAuthDatabaseConfigured, verifyEmailCode } from '../../../utils/authStorage'
import { setOAuthSession } from '../../../utils/oauth'
import { enforceRateLimit } from '../../../utils/rateLimit'
import { getActiveSubscription } from '../../../utils/subscriptionStorage'
import { validatePassword } from '../../../../utils/authValidation'

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'email-verification-verify', 10, 15 * 60 * 1000)
  if (!isAuthDatabaseConfigured()) {
    throw createError({ statusCode: 503, statusMessage: 'Cloud accounts are not configured' })
  }

  const body = await readBody<Record<string, unknown>>(event)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const code = typeof body?.code === 'string' ? body.code.trim() : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!email.includes('@') || !/^\d{6}$/.test(code)) {
    throw createError({ statusCode: 400, statusMessage: 'Verification code is required' })
  }
  if (validatePassword(password, { strict: true })) {
    throw createError({ statusCode: 400, statusMessage: 'Password does not meet requirements' })
  }

  const user = await verifyEmailCode(email, code, password)
  setOAuthSession(event, user)
  return { user, subscription: await getActiveSubscription(user.email) }
})
