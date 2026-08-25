import { Capacitor } from '@capacitor/core'

export function getBackendUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  if (!import.meta.client || !Capacitor.isNativePlatform()) return normalizedPath
  const baseUrl = useRuntimeConfig().public.webAppUrl.trim().replace(/\/$/, '')
  return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath
}

export function getBackendFetchOptions() {
  // Always send cookies so cloud session reaches /api/sync and /api/auth/*.
  return { credentials: 'include' as const }
}
