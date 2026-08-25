<template>
  <Transition name="launch">
    <div
      v-if="visible"
      class="launch-screen"
      role="status"
      aria-live="polite"
      aria-label="Загрузка"
    >
      <DotSphereLoader
        mode="boot"
        :size="188"
        :rings="24"
        :segments="36"
        :cycle="BOOT_CYCLE_SEC"
        color="#ffffff"
        @ordered="onOrdered"
      />
    </div>
  </Transition>
</template>

<script setup lang="ts">
import {
  BOOT_CYCLE_SEC,
  BOOT_ORDERED_END,
} from '~/utils/dotSphereLoader'

const visible = ref(true)
const fallbackMs = Math.round(BOOT_CYCLE_SEC * BOOT_ORDERED_END * 1000) + 200
let fallbackTimer = 0

function finishLaunch() {
  visible.value = false
  if (!import.meta.client) return
  document.documentElement.classList.add('launch-ready')
  document.documentElement.dataset.launchComplete = '1'
  window.dispatchEvent(new CustomEvent('cof:launch-complete'))
}

function onOrdered() {
  if (fallbackTimer) {
    window.clearTimeout(fallbackTimer)
    fallbackTimer = 0
  }
  finishLaunch()
}

onMounted(() => {
  fallbackTimer = window.setTimeout(() => {
    fallbackTimer = 0
    finishLaunch()
  }, fallbackMs)
})

onUnmounted(() => {
  if (fallbackTimer) window.clearTimeout(fallbackTimer)
})
</script>

<style scoped lang="scss">
.launch-screen {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: grid;
  place-items: center;
  background: #000;
}

.launch-leave-active {
  transition: opacity var(--transition-emphasized);
}

.launch-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .launch-leave-active {
    transition-duration: 160ms;
  }
}
</style>
