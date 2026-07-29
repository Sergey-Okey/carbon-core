<template>
  <div class="auth-layout">
    <ThemeToggleButton class="auth-theme-toggle" />
    <main class="auth-layout__content">
      <slot />
    </main>
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import ToastContainer from '~/components/base/ToastContainer.vue'
import ThemeToggleButton from '~/components/ui/primitives/ThemeToggleButton.vue'
</script>

<style scoped lang="scss">
.auth-layout {
  position: relative;
  block-size: 100vh;
  block-size: 100dvh;
  overflow: hidden;
  background: transparent;
}

.auth-layout__content {
  position: relative;
  z-index: 1;
  block-size: 100dvh;
  overflow: hidden;
  padding-block: env(safe-area-inset-top, 0px) env(safe-area-inset-bottom, 0px);
  padding-inline: env(safe-area-inset-left, 0px) env(safe-area-inset-right, 0px);
}

.auth-theme-toggle {
  position: fixed;
  right: max(16px, env(safe-area-inset-right, 0px));
  top: max(16px, env(safe-area-inset-top, 0px));
  z-index: 20;
}

</style>
