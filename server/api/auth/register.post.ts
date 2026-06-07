import { readBody } from 'h3'
import { registerAccount } from '../../utils/authStorage'
import { setOAuthSession } from '../../utils/oauth'

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event)
  const email = typeof body?.email === 'string' ? body.email.trim() : ''
  const password = typeof body?.password === 'string' ? body.password : ''
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  if (!email.includes('@') || password.length < 8 || name.length < 2) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid registration data' })
  }

  let user
  try {
    user = await registerAccount(email, password, name)
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'statusCode' in error) throw error
    throw createError({ statusCode: 503, statusMessage: 'Account database is unavailable' })
  }
  setOAuthSession(event, user)
  return { user }
})
