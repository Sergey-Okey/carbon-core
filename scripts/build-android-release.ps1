$ErrorActionPreference = 'Stop'

$required = @('ANDROID_KEYSTORE_PATH', 'ANDROID_KEYSTORE_PASSWORD', 'ANDROID_KEY_ALIAS', 'ANDROID_KEY_PASSWORD')
$missing = $required | Where-Object { -not [Environment]::GetEnvironmentVariable($_) }
if ($missing.Count -gt 0) {
  throw "Missing Android signing variables: $($missing -join ', ')"
}

$toolCache = Join-Path $env:USERPROFILE '.cache\carbon-android'
$jdk = Get-ChildItem (Join-Path $toolCache 'jdk') -Directory | Select-Object -First 1
$sdk = Join-Path $toolCache 'sdk'
if (-not $jdk -or -not (Test-Path $sdk)) { throw 'Portable Android build tools are missing.' }

$env:JAVA_HOME = $jdk.FullName
$env:ANDROID_HOME = $sdk
$env:ANDROID_SDK_ROOT = $sdk

node scripts/sync-android.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Push-Location android
try {
  .\gradlew.bat bundleRelease --no-daemon `
    "-PCOF_KEYSTORE_PATH=$env:ANDROID_KEYSTORE_PATH" `
    "-PCOF_KEYSTORE_PASSWORD=$env:ANDROID_KEYSTORE_PASSWORD" `
    "-PCOF_KEY_ALIAS=$env:ANDROID_KEY_ALIAS" `
    "-PCOF_KEY_PASSWORD=$env:ANDROID_KEY_PASSWORD"
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
  Pop-Location
}

New-Item -ItemType Directory -Force -Path dist | Out-Null
Copy-Item android\app\build\outputs\bundle\release\app-release.aab dist\core-of-life-release.aab -Force
