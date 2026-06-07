import { spawnSync } from 'node:child_process'

const commands = [
  ['npm', ['run', 'test']],
  ['npm', ['run', 'typecheck']],
  ['npm', ['run', 'build']],
  ['npm', ['audit', '--omit=dev']],
]

for (const [command, args] of commands) {
  const result = spawnSync(command, args, {
    env: { ...process.env, NUXT_IGNORE_LOCK: '1' },
    shell: process.platform === 'win32',
    stdio: 'inherit',
  })

  if (result.status !== 0) process.exit(result.status ?? 1)
}
