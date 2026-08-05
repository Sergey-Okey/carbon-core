<template>
  <div class="auth-layout">
    <main class="auth-layout__content">
      <slot />
    </main>
    <ThemeToggleButton class="auth-theme-toggle" />
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.auth-layout {
  position: relative;
  block-size: 100vh;
  block-size: 100dvh;
  overflow: hidden;
  background: var(--color-bg);
  color: var(--color-text-primary);
}

.auth-layout__content {
  position: relative;
  z-index: 1;
  block-size: 100dvh;
  overflow: hidden;
  padding: 0;
}

.auth-theme-toggle {
  position: fixed;
  right: max(var(--space-4), env(safe-area-inset-right, 0px));
  bottom: max(var(--space-4), env(safe-area-inset-bottom, 0px));
  z-index: 20;
}

@media (max-width: 900px) {
  .auth-theme-toggle {
    top: max(var(--space-3), env(safe-area-inset-top, 0px));
    bottom: auto;
    right: max(var(--space-3), env(safe-area-inset-right, 0px));
  }
}
</style>
