<template>
  <div class="layout" :class="{ 'is-board': isBoardLayout }">
    <LazyBoardAiGlow v-if="isBoardLayout && launchReady" />
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
const { launchReady } = useLaunchGate()
const isBoardLayout = computed(
  () => route.path === '/' && uiStore.activeNav === 'board'
)
</script>

<style scoped lang="scss">
.layout {
  --app-header-stack: calc(
    max(var(--space-3), env(safe-area-inset-top, 0px)) + var(--space-11) + var(--space-1)
  );
  --app-main-pad-top: calc(
    env(safe-area-inset-top, 0px) + var(--space-2) + var(--space-11) + var(--space-2) + 1px +
      var(--space-3)
  );
  --app-main-pad-inline-start: max(var(--space-3), env(safe-area-inset-left, 0px));
  --app-main-pad-inline-end: max(var(--space-3), env(safe-area-inset-right, 0px));
  --app-main-pad-bottom: calc(var(--space-12) + var(--space-10) + env(safe-area-inset-bottom, 0px));
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
      z-index: 1;
      inset: auto;
      overflow: hidden;
      background: transparent;
    }

    .main {
      display: flex;
      flex-direction: column;
      padding-block-start: var(--app-main-pad-top);
      padding-inline-start: var(--app-main-pad-inline-start);
      padding-inline-end: var(--app-main-pad-inline-end);
      padding-block-end: var(--app-main-pad-bottom);
      overflow-x: hidden;
      overflow-y: auto;
    }

    :deep(.nav-island) {
      inset-block-start: auto;
      inset-inline-start: 50%;
      inset-inline-end: auto;
      inset-block-end: var(--board-island-end);
      transform: translateX(-50%);
      transition:
        opacity var(--duration-fast) var(--ease-emphasized),
        transform var(--duration-emphasized) var(--ease-emphasized);
    }

    :deep(.nav-island.is-dock-composer),
    :deep(.nav-island.is-dock-nav) {
      transform-origin: 50% 100%;
    }

    :deep(.nav-island.is-dock-composer) {
      opacity: 0;
      pointer-events: none;
      transform: translateX(-50%) translateY(calc(100% + var(--space-5))) scale(0.96);
    }

    :deep(.nav-island.is-dock-nav) {
      z-index: calc(var(--z-sticky) + 50);
      opacity: 1;
      pointer-events: auto;
      transform: translateX(-50%) translateY(0) scale(1);
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
    padding-block-start: var(--app-main-pad-top);
    padding-inline-start: var(--app-main-pad-inline-start);
    padding-inline-end: var(--app-main-pad-inline-end);
    padding-block-end: var(--app-main-pad-bottom);
  }

  &::-webkit-scrollbar {
    width: var(--space-2);
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--ui-border-color);
    border-radius: var(--space-1);

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        background: var(--dim);
      }
    }
  }
}
</style>
