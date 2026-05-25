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
  min-height: 100vh;
  overflow: hidden;
  background: transparent;
}

.auth-layout__content {
  position: relative;
  z-index: 1;
  min-height: 100vh;
}

.auth-layout__glow {
  position: absolute;
  width: 32rem;
  height: 32rem;
  border-radius: var(--border-radius-pill);
  filter: blur(90px);
  pointer-events: none;
  opacity: 0.55;
}

.auth-layout__glow--left {
  top: -10rem;
  left: -8rem;
  background: color-mix(in srgb, var(--accent) 14%, transparent);
}

.auth-layout__glow--right {
  right: -12rem;
  bottom: -12rem;
  background: color-mix(in srgb, var(--accent) 10%, transparent);
}
</style>
