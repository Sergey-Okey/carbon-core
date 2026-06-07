<template>
  <Transition name="launch">
    <div v-if="visible" class="launch-screen" aria-hidden="true">
      <div class="launch-mark">
        <img src="/app.ico" alt="" />
      </div>
      <strong>Core of Life</strong>
      <span></span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { Capacitor } from '@capacitor/core'

const visible = ref(Capacitor.isNativePlatform())

onMounted(() => {
  if (!visible.value) return
  window.setTimeout(() => {
    visible.value = false
  }, 1250)
})
</script>

<style scoped lang="scss">
.launch-screen {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 18px;
  background: var(--bg);
  color: var(--text);
}

.launch-mark {
  display: grid;
  place-items: center;
  inline-size: 82px;
  block-size: 82px;
  border: var(--ui-border);
  border-radius: 30px;
  background: var(--surface);
  box-shadow: var(--shadow-md);
  animation: launch-mark-in 640ms cubic-bezier(0.16, 1, 0.3, 1) both;

  img {
    inline-size: 58px;
    block-size: 58px;
    border-radius: 20px;
  }
}

strong {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.15rem;
  font-weight: 600;
}

.launch-screen > span {
  inline-size: 38px;
  block-size: 3px;
  border-radius: var(--border-radius-pill);
  background: var(--accent);
  animation: launch-pulse 700ms ease-in-out infinite alternate;
}

.launch-leave-active {
  transition: opacity 320ms ease;
}

.launch-leave-to {
  opacity: 0;
}

@keyframes launch-mark-in {
  from {
    opacity: 0;
    transform: scale(0.82);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes launch-pulse {
  from {
    opacity: 0.35;
    transform: scaleX(0.55);
  }

  to {
    opacity: 1;
    transform: scaleX(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .launch-mark,
  .launch-screen > span {
    animation: none;
  }
}
</style>
