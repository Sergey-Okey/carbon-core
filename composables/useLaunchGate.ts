const launchReady = ref(false)
let listening = false

function markReady() {
  launchReady.value = true
  if (import.meta.client) {
    document.documentElement.classList.add('launch-ready')
    document.documentElement.dataset.launchComplete = '1'
  }
}

function ensureListener() {
  if (!import.meta.client || listening) return
  listening = true
  if (
    document.documentElement.classList.contains('launch-ready') ||
    document.documentElement.dataset.launchComplete === '1'
  ) {
    launchReady.value = true
    return
  }
  window.addEventListener('cof:launch-complete', markReady, { once: true })
}

/** True after AppLaunchScreen finishes; keep chrome (dock/nav) hidden until then. */
export function useLaunchGate() {
  ensureListener()
  if (import.meta.client) {
    onMounted(() => {
      if (
        document.documentElement.classList.contains('launch-ready') ||
        document.documentElement.dataset.launchComplete === '1'
      ) {
        launchReady.value = true
      }
    })
  }
  return { launchReady }
}
