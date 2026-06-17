import { getQuery, getRouterParam, sendRedirect } from 'h3'
import {
  exchangeOAuthCode,
  isOAuthProvider,
  setOAuthSession,
  validateOAuthState,
} from '../../../utils/oauth'
import { upsertOAuthAccount } from '../../../utils/authStorage'

export default defineEventHandler(async (event) => {
  const provider = getRouterParam(event, 'provider')
  const query = getQuery(event)
  if (!isOAuthProvider(provider) || typeof query.code !== 'string' || typeof query.state !== 'string') {
    return sendRedirect(event, '/auth?oauthError=invalid')
  }

  try {
    const termsVersion = validateOAuthState(event, provider, query.state)
    setOAuthSession(
      event,
      await upsertOAuthAccount(await exchangeOAuthCode(event, provider, query.code), termsVersion)
    )
    return sendRedirect(event, '/?oauth=success')
  } catch (error) {
    const statusCode =
      typeof error === 'object' && error !== null && 'statusCode' in error
        ? Number((error as { statusCode?: unknown }).statusCode)
        : 0
    const reason =
      statusCode === 402
        ? 'subscription'
        : statusCode === 403
          ? 'terms'
          : statusCode === 401
            ? 'provider'
            : 'failed'

    return sendRedirect(event, `/auth?oauthError=${reason}`)
  }
})
