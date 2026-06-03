<template>
  <div class="layout">
    <TheHeader />
    <div class="layout-content">
      <TheNavbar />
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
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100vw;
  height: 100vh;
  overflow-x: hidden;
  background-color: var(--bg);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  color: var(--text);
  isolation: isolate;
  transition: background var(--transition-standard);

  > * {
    position: relative;
    z-index: 1;
  }
}

.layout-content {
  display: flex;
  flex: 1;
  width: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;

  @include mobile {
    flex-direction: column;
  }

  @include desktop {
    flex-direction: row;
    padding: 4px 12px 12px;
    gap: 12px;
  }
}

.main {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  min-width: 0;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 16px;
  scroll-behavior: smooth;

  html.compact-ui & {
    padding: 12px;
  }

  @include desktop {
    padding: 20px 12px 20px 16px;

    html.compact-ui & {
      padding: 14px 8px 14px 12px;
    }
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--ui-border-color);
    border-radius: 3px;

    &:hover {
      background: var(--dim);
    }
  }
}
</style>
