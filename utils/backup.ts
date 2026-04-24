export const AUTO_BACKUP_KEY = 'carbon-autobackup-latest'

export interface BackupPayload {
  version: 1
  exportedAt: string
  data: Record<string, unknown>
}

const STORAGE_KEYS = [
  'carbon-user',
  'carbon-users',
  'carbon-auth',
  'carbon-onboarding',
  'carbon-tasks',
  'carbon-branches',
  'carbon-rewards',
  'carbon-tags',
  'carbon-ui',
  'carbon-settings',
] as const

function safeParse(raw: string | null, fallback: unknown) {
  if (!raw) return fallback

  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function buildBackupPayload(): BackupPayload {
  if (!import.meta.client) {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {},
    }
  }

  const data = Object.fromEntries(
    STORAGE_KEYS.map((key) => [key, safeParse(localStorage.getItem(key), null)])
  )

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  }
}

export function saveAutoBackup() {
  if (!import.meta.client) return null
  const payload = buildBackupPayload()
  localStorage.setItem(AUTO_BACKUP_KEY, JSON.stringify(payload))
  return payload
}

export function readAutoBackup(): BackupPayload | null {
  if (!import.meta.client) return null
  return safeParse(
    localStorage.getItem(AUTO_BACKUP_KEY),
    null
  ) as BackupPayload | null
}

export function restoreBackupPayload(payload: BackupPayload | null) {
  if (!import.meta.client || !payload?.data) return false

  for (const key of STORAGE_KEYS) {
    if (Object.prototype.hasOwnProperty.call(payload.data, key)) {
      const value = payload.data[key]
      if (value === null || value === undefined) {
        localStorage.removeItem(key)
      } else {
        localStorage.setItem(key, JSON.stringify(value))
      }
    }
  }

  return true
}
