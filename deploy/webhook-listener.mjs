import { createHmac, timingSafeEqual } from 'node:crypto'
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'

const PORT = Number(process.env.COF_WEBHOOK_PORT || 9876)
const SECRET_FILE = process.env.COF_WEBHOOK_SECRET_FILE || '/var/www/cof-board/.webhook-secret'
const DEPLOY_SCRIPT = process.env.COF_DEPLOY_SCRIPT || '/var/www/cof-board/app/deploy/deploy-from-git.sh'
const BRANCH = process.env.COF_DEPLOY_BRANCH || 'stable'

let deployRunning = false

function readSecret() {
  return readFileSync(SECRET_FILE, 'utf8').trim()
}

function verifySignature(rawBody, signatureHeader) {
  if (!signatureHeader?.startsWith('sha256=')) return false
  const digest = createHmac('sha256', readSecret()).update(rawBody).digest('hex')
  const expected = Buffer.from(`sha256=${digest}`)
  const received = Buffer.from(signatureHeader)
  return expected.length === received.length && timingSafeEqual(expected, received)
}

function shouldDeploy(payload) {
  if (payload?.zen) return false
  const ref = payload?.ref || ''
  return ref === `refs/heads/${BRANCH}`
}

function runDeploy() {
  if (deployRunning) {
    return Promise.resolve({ skipped: true })
  }

  deployRunning = true
  return new Promise((resolve, reject) => {
    const child = spawn('bash', [DEPLOY_SCRIPT], {
      stdio: 'inherit',
      env: process.env,
    })

    child.on('error', reject)
    child.on('close', (code) => {
      deployRunning = false
      if (code === 0) resolve({ ok: true })
      else reject(new Error(`deploy exited with code ${code}`))
    })
  })
}

createServer(async (req, res) => {
  if (req.method !== 'POST' || req.url !== '/git-deploy') {
    res.writeHead(404).end('not found')
    return
  }

  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const rawBody = Buffer.concat(chunks)

  if (!verifySignature(rawBody, req.headers['x-hub-signature-256'])) {
    res.writeHead(401).end('invalid signature')
    return
  }

  let payload
  try {
    payload = JSON.parse(rawBody.toString('utf8'))
  } catch {
    res.writeHead(400).end('invalid json')
    return
  }

  if (!shouldDeploy(payload)) {
    res.writeHead(200).end('ignored')
    return
  }

  if (deployRunning) {
    res.writeHead(202).end('deploy already running')
    return
  }

  // GitHub expects a quick acknowledgement. The build can take longer than
  // GitHub's webhook response timeout, so continue it after responding.
  runDeploy().catch((error) => {
    console.error('deploy failed', error)
  })
  res.writeHead(202).end('deploy started')
}).listen(PORT, '127.0.0.1', () => {
  console.log(`cof-board webhook listening on 127.0.0.1:${PORT}`)
})
