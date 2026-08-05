import { getQuery, getRouterParam, sendRedirect } from 'h3'
import { createAuthorizationUrl, isOAuthProvider } from '../../utils/oauth'

export default defineEventHandler((event) => {
  const provider = getRouterParam(event, 'provider')
  if (!isOAuthProvider(provider)) {
    throw createError({ statusCode: 404, statusMessage: 'Unknown OAuth provider' })
  }
  const query = getQuery(event)
  const termsVersion =
    query.acceptedTerms === 'true' && query.termsVersion === '2026-06-07'
      ? query.termsVersion
      : ''
  try {
    return sendRedirect(event, createAuthorizationUrl(event, provider, termsVersion))
  } catch {
    return sendRedirect(event, '/auth?oauthError=provider')
  }
})
