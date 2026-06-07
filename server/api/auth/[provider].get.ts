import { getRouterParam, sendRedirect } from 'h3'
import { createAuthorizationUrl, isOAuthProvider } from '../../utils/oauth'

export default defineEventHandler((event) => {
  const provider = getRouterParam(event, 'provider')
  if (!isOAuthProvider(provider)) {
    throw createError({ statusCode: 404, statusMessage: 'Unknown OAuth provider' })
  }
  return sendRedirect(event, createAuthorizationUrl(event, provider))
})
