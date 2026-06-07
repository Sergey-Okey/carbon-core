import { getQuery, getRouterParam, sendRedirect } from 'h3'
import {
  exchangeOAuthCode,
  isOAuthProvider,
  setOAuthSession,
  validateOAuthState,
} from '../../../utils/oauth'

export default defineEventHandler(async (event) => {
  const provider = getRouterParam(event, 'provider')
  const query = getQuery(event)
  if (!isOAuthProvider(provider) || typeof query.code !== 'string' || typeof query.state !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid OAuth callback' })
  }

  validateOAuthState(event, provider, query.state)
  setOAuthSession(event, await exchangeOAuthCode(event, provider, query.code))
  return sendRedirect(event, '/?oauth=success')
})
