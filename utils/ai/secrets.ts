const SECRET_KEY =
  /^(.*)?(password|passwd|pwd|secret|token|cookie|authorization|api[_-]?key|private[_-]?key|smtp|session|hash|credential)(.*)?$/i

const SECRET_PATH_HINTS = [
  'password',
  'passwd',
  'secret',
  'token',
  'cookie',
  'authorization',
  'apikey',
  'api_key',
  'privatekey',
  'smtp',
  'session',
  'email',
  'avatar',
]

export function isSecretKey(key: string) {
  const normalized = key.replace(/[^a-z0-9]/gi, '').toLowerCase()
  return SECRET_KEY.test(key) || SECRET_PATH_HINTS.some((hint) => normalized.includes(hint))
}

export function omitSecretFields(value: unknown, depth = 0): unknown {
  if (depth > 8 || value == null) return value
  if (Array.isArray(value)) return value.map((item) => omitSecretFields(item, depth + 1))
  if (typeof value !== 'object') return value
  const next: Record<string, unknown> = {}
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if (isSecretKey(key)) continue
    next[key] = omitSecretFields(nested, depth + 1)
  }
  return next
}

export function containsSecretPayload(value: unknown, depth = 0): boolean {
  if (depth > 8 || value == null) return false
  if (Array.isArray(value)) {
    return value.some((item) => containsSecretPayload(item, depth + 1))
  }
  if (typeof value !== 'object') return false
  return Object.entries(value as Record<string, unknown>).some(([key, nested]) => {
    if (isSecretKey(key)) return true
    return containsSecretPayload(nested, depth + 1)
  })
}
