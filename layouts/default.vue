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
  max-width: 100%;
  min-block-size: 100vh;
  min-block-size: 100dvh;
  block-size: 100vh;
  block-size: 100dvh;
  overflow: hidden;
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
  max-width: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;

  @include mobile {
    flex-direction: column;
  }

  @include desktop {
    flex-direction: row;
    padding-block: 4px 12px;
    padding-inline: 12px;
    gap: 12px;
  }
}

.main {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  min-height: 0;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
  padding-block: clamp(14px, 2vw, 20px);
  padding-inline: clamp(12px, 3vw, 24px);
  scroll-behavior: smooth;

  html.compact-ui & {
    padding: 12px;
  }

  @include desktop {
    padding-block: 20px;
    padding-inline: 16px 12px;

    html.compact-ui & {
      padding: 14px 8px 14px 12px;
    }
  }

  @include mobile {
    padding-inline-start: max(12px, env(safe-area-inset-left, 0px));
    padding-inline-end: max(12px, env(safe-area-inset-right, 0px));
    padding-block-end: calc(96px + env(safe-area-inset-bottom, 0px));
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

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        background: var(--dim);
      }
    }
  }
}
</style>
