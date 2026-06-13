type LogLevel = 'info' | 'warn' | 'error'

function canLog() {
  return import.meta.client
}

function formatMeta(meta?: Record<string, unknown>) {
  if (!meta || Object.keys(meta).length === 0) return undefined
  return meta
}

function write(level: LogLevel, scope: string, message: string, meta?: Record<string, unknown>) {
  if (!canLog()) return

  const time = new Date().toLocaleTimeString('ru-RU', { hour12: false })
  const prefix = `[COF][${time}][${scope}]`
  const payload = formatMeta(meta)

  if (payload) {
    console[level](`${prefix} ${message}`, payload)
    return
  }

  console[level](`${prefix} ${message}`)
}

export const browserLog = {
  info(scope: string, message: string, meta?: Record<string, unknown>) {
    write('info', scope, message, meta)
  },
  warn(scope: string, message: string, meta?: Record<string, unknown>) {
    write('warn', scope, message, meta)
  },
  error(scope: string, message: string, meta?: Record<string, unknown>) {
    write('error', scope, message, meta)
  },
}
