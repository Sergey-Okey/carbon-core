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
  if (
    !isOAuthProvider(provider) ||
    typeof query.code !== 'string' ||
    typeof query.state !== 'string'
  ) {
    return sendRedirect(event, '/auth?oauthError=invalid')
  }

  try {
    const termsVersion = validateOAuthState(event, provider, query.state)
    setOAuthSession(
      event,
      await upsertOAuthAccount(
        await exchangeOAuthCode(event, provider, query.code),
        termsVersion
      )
    )
    return sendRedirect(event, '/auth?oauth=success')
  } catch (error) {
    const statusCode =
      typeof error === 'object' && error !== null && 'statusCode' in error
        ? Number((error as { statusCode?: unknown }).statusCode)
        : 0
    const message =
      typeof error === 'object' &&
      error !== null &&
      'statusMessage' in error &&
      typeof (error as { statusMessage?: unknown }).statusMessage === 'string'
        ? String((error as { statusMessage: string }).statusMessage)
        : ''
    const reason =
      statusCode === 403
        ? 'terms'
        : statusCode === 401 || /OAuth|profile/i.test(message)
          ? 'provider'
          : statusCode === 503
            ? 'provider'
            : 'failed'

    const targetPath = reason === 'terms' ? '/register' : '/auth'
    return sendRedirect(event, `${targetPath}?oauthError=${reason}`)
  }
})
