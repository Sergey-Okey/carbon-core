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
}

export async function sendMail(payload: MailPayload) {
  const config = useRuntimeConfig() as unknown as RuntimeMailConfig
  const host = config.smtpHost?.trim()
  const user = config.smtpUser?.trim()
  const password = config.smtpPassword || ''
  const from = config.smtpFrom?.trim() || user
  const port = Number(config.smtpPort || 465)

  if (!host || !user || !password || !from) return false

  const client = tls.connect({ host, port, servername: host })
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
  return (match?.[1] || value).trim()
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
