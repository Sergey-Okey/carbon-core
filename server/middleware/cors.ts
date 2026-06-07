import { getHeader, setHeader, setResponseStatus } from 'h3'

const nativeOrigins = new Set(['capacitor://localhost', 'http://localhost'])

export default defineEventHandler((event) => {
  if (!event.path.startsWith('/api/')) return
  const origin = getHeader(event, 'origin')
  if (!origin || !nativeOrigins.has(origin)) return

  setHeader(event, 'access-control-allow-origin', origin)
  setHeader(event, 'access-control-allow-credentials', 'true')
  setHeader(event, 'access-control-allow-methods', 'GET,POST,OPTIONS')
  setHeader(event, 'access-control-allow-headers', 'content-type')
  setHeader(event, 'vary', 'origin')

  if (event.method === 'OPTIONS') {
    setResponseStatus(event, 204)
    return ''
  }
})
