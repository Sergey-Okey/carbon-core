const launchReady = ref(false)
let listening = false

function isAlreadyComplete() {
  if (!import.meta.client) return false
  return (
    document.documentElement.dataset.launchComplete === '1' ||
    document.documentElement.classList.contains('launch-ready')
  )
}

function markReady() {
  launchReady.value = true
  if (!import.meta.client) return
  document.documentElement.dataset.launchComplete = '1'
  document.documentElement.classList.add('launch-ready')
}

function ensureListener() {
  if (!import.meta.client || listening) return
  listening = true
  if (isAlreadyComplete()) {
    launchReady.value = true
    return
  }
  window.addEventListener('cof:launch-complete', markReady, { once: true })
}

/** Gates chrome that must stay hidden under AppLaunchScreen (teleported islands, etc.). */
export function useLaunchGate() {
  ensureListener()

  onMounted(() => {
    if (isAlreadyComplete()) launchReady.value = true
  })

  return { launchReady: readonly(launchReady) }
}
