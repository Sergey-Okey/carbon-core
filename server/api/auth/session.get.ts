import { clearOAuthSession, readOAuthSession } from '../../utils/oauth'
import { hasActiveSubscription } from '../../utils/subscriptionStorage'

export default defineEventHandler(async (event) => {
  const user = readOAuthSession(event)
  if (!user) return { user: null }
  if (!(await hasActiveSubscription(user.email))) {
    clearOAuthSession(event)
    return { user: null }
  }
  return { user }
})
