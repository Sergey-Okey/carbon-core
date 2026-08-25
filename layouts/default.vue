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
    padding-block: var(--space-1) var(--space-3);
    padding-inline: var(--space-3);
    gap: var(--space-3);
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
    inset-inline-start: var(--space-3);
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
  padding-block: clamp(var(--space-4), 2vw, var(--space-5));
  padding-inline: clamp(var(--space-3), 3vw, var(--space-6));
  scroll-behavior: smooth;

  html.compact-ui & {
    padding: var(--space-3);
  }

  @include desktop {
    padding-block: var(--space-5);
    padding-inline: var(--space-4) var(--space-3);

    html.compact-ui & {
      padding: var(--space-4) var(--space-2) var(--space-4) var(--space-3);
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
    padding-block-end: calc(var(--space-12) + var(--space-10) + env(safe-area-inset-bottom, 0px));
  }

  &::-webkit-scrollbar {
    width: var(--space-2);
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
