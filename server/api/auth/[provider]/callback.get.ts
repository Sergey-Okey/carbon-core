import { getQuery, getRouterParam, sendRedirect } from 'h3'
import { sendWelcomeRegistrationMail } from '../../../utils/authMail'
import { upsertOAuthAccount } from '../../../utils/authStorage'
import {
  exchangeOAuthCode,
  isOAuthProvider,
  setOAuthSession,
  validateOAuthState,
} from '../../../utils/oauth'

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
    const { user, created } = await upsertOAuthAccount(
      await exchangeOAuthCode(event, provider, query.code),
      termsVersion
    )
    setOAuthSession(event, user)
    if (created) {
      void sendWelcomeRegistrationMail({ name: user.name, email: user.email })
    }
    const welcomeQuery = created ? '&welcome=1' : ''
    return sendRedirect(event, `/?oauth=success&refresh=1${welcomeQuery}`)
  } catch (error) {
    console.error('[auth] oauth callback failed', provider, error)
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
            : statusCode === 400
              ? 'invalid'
              : 'failed'

    const targetPath =
      reason === 'subscription' || reason === 'terms' ? '/register' : '/auth'
    return sendRedirect(event, `${targetPath}?oauthError=${reason}`)
  }
})
