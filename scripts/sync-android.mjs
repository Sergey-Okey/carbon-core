import { rm } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    shell: process.platform === 'win32',
    stdio: 'inherit',
  })

  if (result.status !== 0) process.exit(result.status ?? 1)
}

run('npm', ['run', 'generate'])

// The downloadable APK belongs on the website, not inside the mobile bundle.
await rm('.output/public/downloads/core-of-life.apk', { force: true })

run('node', ['node_modules/@capacitor/cli/bin/capacitor', 'sync', 'android'])
