import { readBody } from 'h3'
import { isAuthDatabaseConfigured, verifyEmailCode } from '../../../utils/authStorage'
import { setOAuthSession } from '../../../utils/oauth'
import { enforceRateLimit } from '../../../utils/rateLimit'
import { getActiveSubscription } from '../../../utils/subscriptionStorage'

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'email-verification-verify', 10, 15 * 60 * 1000)
  if (!isAuthDatabaseConfigured()) {
    throw createError({ statusCode: 503, statusMessage: 'Cloud accounts are not configured' })
  }

  const body = await readBody<Record<string, unknown>>(event)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const code = typeof body?.code === 'string' ? body.code.trim() : ''
  if (!email.includes('@') || !/^\d{6}$/.test(code)) {
    throw createError({ statusCode: 400, statusMessage: 'Verification code is required' })
  }

  const user = await verifyEmailCode(email, code)
  const subscription = await getActiveSubscription(user.email)
  if (!subscription.active) {
    throw createError({ statusCode: 402, statusMessage: 'Active subscription is required' })
  }
  setOAuthSession(event, user)
  return { user, subscription }
})
