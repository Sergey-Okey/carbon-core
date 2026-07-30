<template>
  <Transition name="page-load">
    <div
      v-if="visible"
      class="page-loading"
      role="status"
      aria-live="polite"
      aria-label="Загрузка страницы"
    >
      <DotSphereLoader
        ref="loaderRef"
        mode="adaptive"
        :size="128"
        :rings="20"
        :segments="30"
        color="#ffffff"
      />
    </div>
  </Transition>
</template>

<script setup lang="ts">
type LoaderExpose = { finish: () => Promise<void> }

const visible = ref(false)
const loaderRef = ref<LoaderExpose | null>(null)
let hideTimer = 0
let showTimer = 0
let closing = false
let bootstrapped = false
let launchDone = false
const SHOW_DELAY = 100

function markLaunchDone() {
  launchDone = true
}

onMounted(() => {
  const nuxtApp = useNuxtApp()
  window.addEventListener('cof:launch-complete', markLaunchDone)
  window.setTimeout(markLaunchDone, 6000)

  nuxtApp.hook('page:start', () => {
    if (!bootstrapped || !launchDone) return
    closing = false
    if (hideTimer) {
      window.clearTimeout(hideTimer)
      hideTimer = 0
    }
    if (showTimer) window.clearTimeout(showTimer)
    showTimer = window.setTimeout(() => {
      visible.value = true
      showTimer = 0
    }, SHOW_DELAY)
  })

  const endLoading = async () => {
    if (!bootstrapped) {
      bootstrapped = true
      return
    }
    if (showTimer) {
      window.clearTimeout(showTimer)
      showTimer = 0
      return
    }
    if (!visible.value || closing) return
    closing = true

    try {
      await nextTick()
      await loaderRef.value?.finish()
    } catch {}

    hideTimer = window.setTimeout(() => {
      visible.value = false
      hideTimer = 0
      closing = false
    }, 120)
  }

  nuxtApp.hook('page:finish', () => {
    void endLoading()
  })
  nuxtApp.hook('page:loading:end', () => {
    void endLoading()
  })
})

onUnmounted(() => {
  window.removeEventListener('cof:launch-complete', markLaunchDone)
  if (showTimer) window.clearTimeout(showTimer)
  if (hideTimer) window.clearTimeout(hideTimer)
})
</script>

<style scoped lang="scss">
.page-loading {
  position: fixed;
  inset: 0;
  z-index: 9990;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, #000 78%, transparent);
  pointer-events: all;
}

.page-load-enter-active,
.page-load-leave-active {
  transition: opacity var(--transition-emphasized);
}

.page-load-enter-from,
.page-load-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .page-load-enter-active,
  .page-load-leave-active {
    transition-duration: 100ms;
  }
}
</style>
