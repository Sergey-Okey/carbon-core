import { spawnSync } from 'node:child_process'

const commands = [
  ['npm', ['run', 'test']],
  ['npm', ['run', 'typecheck']],
  ['npm', ['run', 'build']],
  ['npm', ['audit', '--omit=dev']],
]

for (const [command, args] of commands) {
  const useNpmCli = command === 'npm' && process.env.npm_execpath
  const executable = useNpmCli ? process.execPath : command
  const executableArgs = useNpmCli ? [process.env.npm_execpath, ...args] : args
  const result = spawnSync(executable, executableArgs, {
    env: { ...process.env, NUXT_IGNORE_LOCK: '1' },
    stdio: 'inherit',
  })

  if (result.status !== 0) process.exit(result.status ?? 1)
}
