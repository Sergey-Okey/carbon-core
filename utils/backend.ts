export function getBackendUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return normalizedPath
}

export function getBackendFetchOptions() {
  // Always send cookies so cloud session reaches /api/sync and /api/auth/*.
  return { credentials: 'include' as const }
}

/** Returns the server text when a request was rejected by the human check. */
export function getCaptchaErrorMessage(error: unknown) {
  if (typeof error !== 'object' || error === null) return ''
  const candidate = error as {
    statusMessage?: unknown
    data?: { statusMessage?: unknown; message?: unknown }
  }
  const message = String(
    candidate.data?.statusMessage ||
      candidate.statusMessage ||
      candidate.data?.message ||
      ''
  )
  return /робот|Проверка не прошла/i.test(message) ? message : ''
}
