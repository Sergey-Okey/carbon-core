import net from 'node:net'
import tls from 'node:tls'

type MailPayload = {
  to: string
  subject: string
  text: string
}

type RuntimeMailConfig = {
  smtpHost?: string
  smtpPort?: number
  smtpUser?: string
  smtpPassword?: string
  smtpFrom?: string
  smtpApiKey?: string
  smtpApiUrl?: string
}

function getMailConfig() {
  const config = useRuntimeConfig() as unknown as RuntimeMailConfig
  const host = (config.smtpHost || process.env.SMTP_HOST || '').trim()
  const user = (config.smtpUser || process.env.SMTP_USER || '').trim()
  const password = config.smtpPassword || process.env.SMTP_PASSWORD || ''
  const from = (config.smtpFrom || process.env.SMTP_FROM || '').trim() || user
  const port = Number(config.smtpPort || process.env.SMTP_PORT || 465)
  const apiKey = (config.smtpApiKey || process.env.SMTP_API_KEY || '').trim()
  const apiUrl = (
    config.smtpApiUrl ||
    process.env.SMTP_API_URL ||
    'https://api.smtp.bz/v1/smtp/send'
  ).trim()
  return { host, user, password, from, port, apiKey, apiUrl }
}

function hasSmtpCredentials() {
  const { host, user, password, from, port } = getMailConfig()
  return Boolean(host && user && password && from && Number.isInteger(port) && port > 0)
}

function hasApiCredentials() {
  const { apiKey, from } = getMailConfig()
  return Boolean(apiKey && from)
}

export function isMailConfigured() {
  return hasApiCredentials() || hasSmtpCredentials()
}

export async function sendMail(payload: MailPayload) {
  const config = getMailConfig()
  if (!config.from) return false

  // Prefer HTTPS API: many VPS hosts can reach api.smtp.bz:443 while smtp.bz:587 is refused.
  if (hasApiCredentials()) {
    return await sendMailViaApi(payload, config)
  }

  if (!hasSmtpCredentials()) return false
  return await sendMailViaSmtp(payload, config)
}

async function sendMailViaApi(
  payload: MailPayload,
  config: ReturnType<typeof getMailConfig>
) {
  const fromEmail = extractEmail(config.from)
  const fromName = extractDisplayName(config.from) || 'Core of Life'
  const form = new FormData()
  form.set('from', fromEmail)
  form.set('name', fromName)
  form.set('subject', payload.subject)
  form.set('to', payload.to)
  form.set('text', payload.text)
  form.set('html', textToHtml(payload.text))

  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      Authorization: config.apiKey,
      accept: 'application/json',
    },
    body: form,
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`SMTP API error ${response.status}${detail ? `: ${detail.slice(0, 200)}` : ''}`)
  }

  return true
}

async function sendMailViaSmtp(
  payload: MailPayload,
  config: ReturnType<typeof getMailConfig>
) {
  const { host, user, password, from, port } = config

  let client: net.Socket | tls.TLSSocket =
    port === 465 ? tls.connect({ host, port, servername: host }) : net.connect({ host, port })
  client.setEncoding('utf8')

  let buffer = ''
  const waitFor = (expected: number[]) =>
    new Promise<string>((resolve, reject) => {
      const onData = (chunk: string) => {
        buffer += chunk
        const lines = buffer.split(/\r?\n/)
        const last = [...lines].reverse().find((line) => /^\d{3} /.test(line))
        if (!last) return
        const code = Number(last.slice(0, 3))
        if (!expected.includes(code)) {
          cleanup()
          reject(new Error(`SMTP error ${last}`))
          return
        }
        const response = buffer
        buffer = ''
        cleanup()
        resolve(response)
      }
      const onError = (error: Error) => {
        cleanup()
        reject(error)
      }
      const cleanup = () => {
        client.off('data', onData)
        client.off('error', onError)
      }
      client.on('data', onData)
      client.on('error', onError)
    })

  const command = async (line: string, expected: number[]) => {
    client.write(`${line}\r\n`)
    await waitFor(expected)
  }

  try {
    await waitFor([220])
    await command(`EHLO ${host}`, [250])
    if (port !== 465) {
      await command('STARTTLS', [220])
      client = tls.connect({ socket: client, servername: host })
      client.setEncoding('utf8')
      await waitForSecureConnect(client as tls.TLSSocket)
      buffer = ''
      await command(`EHLO ${host}`, [250])
    }
    await command('AUTH LOGIN', [334])
    await command(Buffer.from(user).toString('base64'), [334])
    await command(Buffer.from(password).toString('base64'), [235])
    await command(`MAIL FROM:<${extractEmail(from)}>`, [250])
    await command(`RCPT TO:<${payload.to}>`, [250, 251])
    await command('DATA', [354])
    client.write(formatMessage({ ...payload, from }))
    await waitFor([250])
    await command('QUIT', [221])
    return true
  } finally {
    client.end()
  }
}

function extractEmail(value: string) {
  const match = value.match(/<([^>]+)>/)
  return (match?.[1] || value).trim().replace(/^"|"$/g, '')
}

function extractDisplayName(value: string) {
  const match = value.match(/^\s*"?([^"<]+?)"?\s*</)
  return match?.[1]?.trim() || ''
}

function textToHtml(text: string) {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
  return `<pre style="font-family:sans-serif;white-space:pre-wrap;line-height:1.5">${escaped}</pre>`
}

function waitForSecureConnect(client: tls.TLSSocket) {
  return new Promise<void>((resolve, reject) => {
    const onSecure = () => {
      cleanup()
      resolve()
    }
    const onError = (error: Error) => {
      cleanup()
      reject(error)
    }
    const cleanup = () => {
      client.off('secureConnect', onSecure)
      client.off('error', onError)
    }
    client.once('secureConnect', onSecure)
    client.once('error', onError)
  })
}

function formatMessage(payload: MailPayload & { from: string }) {
  const headers = [
    `From: ${payload.from}`,
    `To: ${payload.to}`,
    `Subject: =?UTF-8?B?${Buffer.from(payload.subject).toString('base64')}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
  ]
  return `${headers.join('\r\n')}\r\n\r\n${payload.text}\r\n.\r\n`
}
