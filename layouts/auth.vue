<template>
  <div class="auth-layout">
    <div class="auth-layout__glow auth-layout__glow--left"></div>
    <div class="auth-layout__glow auth-layout__glow--right"></div>
    <main class="auth-layout__content">
      <slot />
    </main>
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import ToastContainer from '~/components/base/ToastContainer.vue'
</script>

<style scoped lang="scss">
.auth-layout {
  position: relative;
  block-size: 100vh;
  block-size: 100dvh;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  background: transparent;
}

.auth-layout__content {
  position: relative;
  z-index: 1;
  min-block-size: 100vh;
  min-block-size: 100dvh;
  padding-block: env(safe-area-inset-top, 0px) env(safe-area-inset-bottom, 0px);
  padding-inline: env(safe-area-inset-left, 0px) env(safe-area-inset-right, 0px);
}

.auth-layout__glow {
  position: absolute;
  inline-size: min(32rem, 90dvw);
  block-size: min(32rem, 90dvw);
  border-radius: var(--border-radius-pill);
  filter: blur(90px);
  pointer-events: none;
  opacity: 0.55;
}

.auth-layout__glow--left {
  inset-block-start: -10rem;
  inset-inline-start: -8rem;
  background: color-mix(in srgb, var(--accent) 14%, transparent);
}

.auth-layout__glow--right {
  inset-inline-end: -12rem;
  inset-block-end: -12rem;
  background: color-mix(in srgb, var(--accent) 10%, transparent);
}
</style>
