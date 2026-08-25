/**
 * Cloudflare Worker: VPS → OpenRouter.
 * SpaceWeb IPs are blocked by OpenRouter's Cloudflare WAF;
 * workers.dev egress is not.
 *
 *   cd deploy
 *   npx wrangler deploy -c wrangler.openrouter-proxy.toml
 *   npx wrangler secret put PROXY_SECRET -c wrangler.openrouter-proxy.toml
 *
 * Then on the VPS:
 *   OPENROUTER_PROXY_URL=https://<name>.<subdomain>.workers.dev/api/v1
 *   OPENROUTER_PROXY_SECRET=<same secret>
 */
const OPENROUTER_ORIGIN = 'https://openrouter.ai'
const ALLOWED_PATHS = new Set(['/api/v1/chat/completions', '/api/v1/models'])

function isAllowedMethod(pathname, method) {
  if (pathname === '/api/v1/models') return method === 'GET' || method === 'HEAD'
  return method === 'POST'
}

function outboundHeaders(incoming) {
  const headers = new Headers({
    accept: 'application/json',
    'user-agent': 'CoreOfLife/1.0',
    'HTTP-Referer': 'https://cof-board.com',
    'X-Title': 'Core of Life',
  })
  const authorization = incoming.get('authorization')
  const contentType = incoming.get('content-type')
  if (authorization) headers.set('authorization', authorization)
  if (contentType) headers.set('content-type', contentType)
  return headers
}

export default {
  async fetch(request, env) {
    const secret = String(env.PROXY_SECRET || '')
    if (!secret || request.headers.get('x-cof-proxy-secret') !== secret) {
      return new Response('forbidden', { status: 403 })
    }

    const incoming = new URL(request.url)
    if (!ALLOWED_PATHS.has(incoming.pathname) || !isAllowedMethod(incoming.pathname, request.method)) {
      return new Response('not found', { status: 404 })
    }

    const target = new URL(incoming.pathname + incoming.search, OPENROUTER_ORIGIN)
    const headers = outboundHeaders(request.headers)
    const init = {
      method: request.method,
      headers,
    }
    if (request.method === 'POST') init.body = request.body

    return fetch(target, init)
  },
}
