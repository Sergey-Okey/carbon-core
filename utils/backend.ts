export function getBackendUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return normalizedPath
}

export function getBackendFetchOptions() {
  // Always send cookies so cloud session reaches /api/sync and /api/auth/*.
  return { credentials: 'include' as const }
}
