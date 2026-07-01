import { existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { spawn } from 'node:child_process'
import os from 'node:os'

const port = process.argv[2] || '3000'
const tempDir = os.tmpdir()
const socketCandidates = [
  join(tempDir, 'nuxt-vite-node.sock'),
  join(tempDir, `nuxt-vite-node-${process.env.USER || 'user'}.sock`),
]

for (const file of socketCandidates) {
  if (existsSync(file)) {
    try {
      rmSync(file, { force: true })
    } catch {
      // ignore cleanup failures
    }
  }
}

const child = spawn(
  process.execPath,
  ['node_modules/nuxt/bin/nuxt.mjs', 'cleanup'],
  {
    stdio: 'inherit',
    env: { ...process.env, FORCE_COLOR: '1' },
  }
)

child.on('exit', (code) => {
  if (code !== 0) process.exit(code ?? 1)

  const dev = spawn(
    process.execPath,
    [
      'node_modules/nuxt/bin/nuxt.mjs',
      'dev',
      '--host',
      '0.0.0.0',
      '--port',
      port,
    ],
    {
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: '1' },
    }
  )

  dev.on('exit', (exitCode) => process.exit(exitCode ?? 1))
})
