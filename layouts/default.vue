<template>
  <div class="layout">
    <TheHeader />
    <div class="layout-content">
      <TheNavbar class="navbar" />
      <main class="main">
        <slot />
      </main>
    </div>
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import TheHeader from '~/components/base/TheHeader.vue'
import TheNavbar from '~/components/base/TheNavbar.vue'
import ToastContainer from '~/components/base/ToastContainer.vue'
</script>

<style scoped lang="scss">
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg);
  color: var(--accent);
  transition: background 0.3s ease;
}

.layout-content {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;

  @include mobile {
    flex-direction: column;
  }

  @include desktop {
    flex-direction: row;
    padding: 4px 0;
  }
}

.navbar {
  flex-shrink: 0;
  align-self: center;
}

.main {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px;
  scroll-behavior: smooth;

  @include desktop {
    padding: 20px 24px;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 3px;

    &:hover {
      background: var(--dim);
    }
  }
}
</style>
