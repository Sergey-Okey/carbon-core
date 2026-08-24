<template>
  <div class="layout" :class="{ 'is-board': isBoardLayout }">
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
const route = useRoute()
const uiStore = useUIStore()
const isBoardLayout = computed(
  () => route.path === '/' && uiStore.activeNav === 'board'
)
</script>

<style scoped lang="scss">
.layout {
  --app-header-stack: calc(
    max(var(--space-3), env(safe-area-inset-top, 0px)) + var(--space-11) + var(--space-1)
  );
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
  transition: background var(--transition-standard);
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

.layout.is-board {
  .layout-content {
    position: absolute;
    inset: 0;
    padding: 0;
    gap: 0;
  }

  .main {
    padding: 0;
    overflow: hidden;
  }

  :deep(.header) {
    position: fixed;
    inset-block-start: 0;
    inset-inline: 0;
    z-index: 3000;
  }

  :deep(.nav-island) {
    position: fixed;
    inset-block-start: calc(
      var(--app-header-stack) + (100dvh - var(--app-header-stack)) / 2
    );
    inset-inline-start: 12px;
    z-index: 3000;
    margin: 0;
    transform: translateY(-50%);
    background: color-mix(in srgb, var(--color-surface-1) 52%, transparent);
    backdrop-filter: var(--glass-filter, blur(18px) saturate(1.2));
    -webkit-backdrop-filter: var(--glass-filter, blur(18px) saturate(1.2));
    box-shadow: none;
  }

  @include mobile {
    .layout-content {
      position: relative;
      inset: auto;
      overflow: hidden;
    }

    .main {
      display: flex;
      flex-direction: column;
      padding: 0;
      overflow: hidden;
    }

    :deep(.nav-island) {
      inset-block-start: auto;
      inset-inline-start: 50%;
      inset-inline-end: auto;
      inset-block-end: max(var(--space-3), env(safe-area-inset-bottom, 0px));
      transform: translateX(-50%);
      inline-size: fit-content;
      background-color: color-mix(in srgb, var(--surface) 42%, transparent);
      backdrop-filter: var(--glass-strong-filter);
      -webkit-backdrop-filter: var(--glass-strong-filter);
    }
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

    display: block;

    padding-block-start: calc(
      env(safe-area-inset-top, 0px) + var(--space-2) + var(--space-11) + var(--space-2) + 1px +
        var(--space-3)
    );
    padding-inline-start: max(var(--space-3), env(safe-area-inset-left, 0px));
    padding-inline-end: max(var(--space-3), env(safe-area-inset-right, 0px));
    padding-block-end: calc(88px + env(safe-area-inset-bottom, 0px));
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
