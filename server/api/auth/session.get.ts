import { clearOAuthSession, readOAuthSession, setOAuthSession } from '../../utils/oauth'
import { getAccountById } from '../../utils/authStorage'
import { getActiveSubscription } from '../../utils/subscriptionStorage'

export default defineEventHandler(async (event) => {
  const session = readOAuthSession(event)
  if (!session) return { user: null, subscription: { active: false, expiresAt: '' } }

  const user = await getAccountById(session.id).catch(() => null)
  if (!user) {
    clearOAuthSession(event)
    return { user: null, subscription: { active: false, expiresAt: '' } }
  }

  const subscription = await getActiveSubscription(user.email)
  if (!subscription.active) {
    clearOAuthSession(event)
    return { user: null, subscription }
  }

  setOAuthSession(event, user)
  return { user, subscription }
})
