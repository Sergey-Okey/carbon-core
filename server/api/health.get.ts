import { getDatabaseHealth } from '../utils/syncStorage'

export default defineEventHandler(async () => {
  try {
    const database = await getDatabaseHealth()
    return {
      status: !database.configured || database.reachable ? 'ok' : 'degraded',
      mode: database.configured ? 'database' : 'local',
      database,
      timestamp: new Date().toISOString(),
    }
  } catch {
    return {
      status: 'degraded',
      mode: 'database',
      database: { configured: true, reachable: false },
      timestamp: new Date().toISOString(),
    }
  }
})
