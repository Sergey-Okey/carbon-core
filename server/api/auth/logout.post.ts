import { clearOAuthSession } from '../../utils/oauth'

export default defineEventHandler((event) => {
  clearOAuthSession(event)
  return { success: true }
})
