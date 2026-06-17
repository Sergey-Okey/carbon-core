import { readBody } from 'h3'
import { isAuthDatabaseConfigured, loginAccount } from '../../utils/authStorage'
import { setOAuthSession } from '../../utils/oauth'
import { enforceRateLimit } from '../../utils/rateLimit'
import { hasActiveSubscription } from '../../utils/subscriptionStorage'

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, 'login', 10, 15 * 60 * 1000)
  if (!isAuthDatabaseConfigured()) {
    throw createError({ statusCode: 503, statusMessage: 'Cloud accounts are not configured' })
  }
  const body = await readBody<Record<string, unknown>>(event)
  const email = typeof body?.email === 'string' ? body.email : ''
  const password = typeof body?.password === 'string' ? body.password : ''
  if (!email || !password) throw createError({ statusCode: 400, statusMessage: 'Email and password are required' })

  let user
  try {
    user = await loginAccount(email, password)
    if (!(await hasActiveSubscription(user.email))) {
      throw createError({ statusCode: 402, statusMessage: 'Active subscription is required' })
    }
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'statusCode' in error) throw error
    throw createError({ statusCode: 503, statusMessage: 'Account database is unavailable' })
  }
  setOAuthSession(event, user)
  return { user }
})
