<template>
  <Transition name="launch">
    <div v-if="visible" class="launch-screen" aria-hidden="true">
      <div class="launch-mark">
        <img src="/app.ico" alt="" />
      </div>
      <strong>Core of Life</strong>
      <Skeleton width="38px" height="3px" round />
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { Capacitor } from '@capacitor/core'
import Skeleton from '~/components/ui/feedback/Skeleton.vue'

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

@media (prefers-reduced-motion: reduce) {
  .launch-mark {
    animation: none;
  }
}
</style>
