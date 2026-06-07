import { readOAuthSession } from '../../utils/oauth'

export default defineEventHandler((event) => ({ user: readOAuthSession(event) }))
