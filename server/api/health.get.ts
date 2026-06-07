import { getDatabaseHealth } from '../utils/syncStorage'
import { getOAuthProviders } from '../utils/oauth'

export default defineEventHandler(async () => {
  try {
    const database = await getDatabaseHealth()
    return {
      status: !database.configured || database.reachable ? 'ok' : 'degraded',
      mode: database.configured ? 'database' : 'local',
      database,
      oauth: getOAuthProviders(),
      timestamp: new Date().toISOString(),
    }
  } catch {
    return {
      status: 'degraded',
      mode: 'database',
      database: { configured: true, reachable: false },
      oauth: getOAuthProviders(),
      timestamp: new Date().toISOString(),
    }
  }
})
