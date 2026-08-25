import { readBody } from 'h3'
import { isAuthDatabaseConfigured, loginAccount } from '../../utils/authStorage'
import { setOAuthSession } from '../../utils/oauth'
import { enforceRateLimit } from '../../utils/rateLimit'
import { getActiveSubscription } from '../../utils/subscriptionStorage'
import { assertHuman } from '../../utils/turnstile'

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'login', 10, 15 * 60 * 1000)
  if (!isAuthDatabaseConfigured()) {
    throw createError({ statusCode: 503, statusMessage: 'Cloud accounts are not configured' })
  }
  const body = await readBody<Record<string, unknown>>(event)
  await assertHuman(event, body?.turnstileToken)
  const email = typeof body?.email === 'string' ? body.email : ''
  const password = typeof body?.password === 'string' ? body.password : ''
  if (!email || !password) throw createError({ statusCode: 400, statusMessage: 'Email and password are required' })

  let user
  let subscription
  try {
    user = await loginAccount(email, password)
    const paid = await getActiveSubscription(user.email)
    // Account access no longer requires a paid subscription.
    subscription = { active: true, expiresAt: paid.expiresAt || '' }
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'statusCode' in error) throw error
    throw createError({ statusCode: 503, statusMessage: 'Account database is unavailable' })
  }
  setOAuthSession(event, user)
  return { user, subscription }
})
