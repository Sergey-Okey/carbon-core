<template>
  <div class="auth-layout">
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

</style>
