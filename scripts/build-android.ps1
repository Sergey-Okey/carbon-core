$ErrorActionPreference = 'Stop'

$toolCache = Join-Path $env:USERPROFILE '.cache\carbon-android'
$jdk = Get-ChildItem (Join-Path $toolCache 'jdk') -Directory | Select-Object -First 1
$sdk = Join-Path $toolCache 'sdk'

if (-not $jdk -or -not (Test-Path $sdk)) {
  throw 'Portable Android build tools are missing from ~/.cache/carbon-android.'
}

$env:JAVA_HOME = $jdk.FullName
$env:ANDROID_HOME = $sdk
$env:ANDROID_SDK_ROOT = $sdk

node scripts/sync-android.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Push-Location android
try {
  .\gradlew.bat assembleDebug --no-daemon
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
  Pop-Location
}

New-Item -ItemType Directory -Force -Path public\downloads | Out-Null
Copy-Item android\app\build\outputs\apk\debug\app-debug.apk public\downloads\core-of-life.apk -Force
