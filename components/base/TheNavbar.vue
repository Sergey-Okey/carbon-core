<template>
  <nav
    v-if="launchReady"
    class="nav-island"
    :class="{
      'is-mobile': isMobile,
      'is-dock-composer': isDockComposer,
      'is-dock-nav': isDockNav,
      'is-swipe-hint': showSwipeHint && isDockNav,
    }"
    aria-label="Основная навигация"
    @pointerdown="onDockPointerDown"
    @pointerup="onDockPointerUp"
    @pointercancel="onDockPointerUp"
  >
    <div class="nav-track">
      <button
        v-for="item in navItems"
        :key="item.id"
        type="button"
        class="nav-item"
        :class="{ active: uiStore.activeNav === item.id }"
        :aria-label="item.label"
        :aria-current="uiStore.activeNav === item.id ? 'page' : undefined"
        :data-tour="`nav-${item.id}`"
        @click="handleNavClick(item.id)"
      >
        <span class="icon-shell">
          <component :is="item.icon" :size="isMobile ? 22 : 20" />
        </span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import {
  BarChart2,
  CheckSquare,
  LayoutGrid,
  Settings,
  Sparkles,
  Timer,
} from 'lucide-vue-next'
import type { NavSection } from '~/stores/ui.store'

const uiStore = useUIStore()
const guidedTour = useGuidedTourStore()
const route = useRoute()
const router = useRouter()
const { launchReady } = useLaunchGate()
const { onPointerDown, onPointerUp, consumeSwipe } = useBoardDockSwipe()

const isMobile = ref(import.meta.client ? window.innerWidth < 768 : true)
const showSwipeHint = ref(true)
let hintTimer = 0
const isBoard = computed(
  () => route.path === '/' && uiStore.activeNav === 'board'
)
const isDockComposer = computed(
  () =>
    isMobile.value &&
    isBoard.value &&
    !uiStore.showAiAgent &&
    uiStore.boardDock === 'composer'
)
const isDockNav = computed(
  () =>
    isMobile.value &&
    isBoard.value &&
    !uiStore.showAiAgent &&
    uiStore.boardDock === 'nav'
)

const navItems = computed(() => {
  const boardIcon = isMobile.value ? Sparkles : LayoutGrid
  const boardLabel = isMobile.value ? 'Агент' : 'Доска'
  return [
    { id: 'board' as const, label: boardLabel, icon: boardIcon },
    { id: 'tasks' as const, label: 'Задачи', icon: CheckSquare },
    { id: 'shop' as const, label: 'Фокус', icon: Timer },
    { id: 'analytics' as const, label: 'Аналитика', icon: BarChart2 },
    { id: 'settings' as const, label: 'Настройки', icon: Settings },
  ]
})

function checkMobile() {
  isMobile.value = window.innerWidth < 768
  uiStore.setSidebarHovered(false)
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  if (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('no-animations')
  ) {
    showSwipeHint.value = false
    return
  }
  hintTimer = window.setTimeout(() => {
    showSwipeHint.value = false
  }, 4200)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  if (hintTimer) window.clearTimeout(hintTimer)
})

function onDockPointerDown(event: PointerEvent) {
  if (!isDockNav.value) return
  onPointerDown(event)
}

function onDockPointerUp(event: PointerEvent) {
  if (!isDockNav.value) return
  onPointerUp(event)
}

async function handleNavClick(section: NavSection) {
  if (consumeSwipe()) return
  if (isDockNav.value && section === 'board') {
    uiStore.setBoardDock('composer')
    return
  }

  uiStore.setActiveNav(section)
  guidedTour.handleAction(`nav:${section}`)

  if (route.path !== '/') {
    await router.push('/')
  }
}
</script>

<style scoped lang="scss">
.nav-island {
  @include surface-panel;
  position: relative;
  overflow: visible;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: var(--z-sticky);
  color: var(--color-text-primary);
  border-radius: var(--radius-full);
  transition:
    border-color var(--transition-standard),
    background var(--transition-standard);

  @include desktop {
    align-self: center;
    inline-size: var(--space-16);
    margin-block: 0;
    margin-inline: auto;
    padding-block: var(--space-3);
    border: var(--ui-border);
  }

  @include mobile {
    @include island-shell;
    position: fixed;
    inset-inline-start: 50%;
    inset-inline-end: auto;
    inset-block-end: var(--board-island-end);
    transform: translateX(-50%);
    animation: nav-fade-up var(--transition-emphasized) both;

    &.is-dock-composer,
    &.is-dock-nav {
      animation: none;
      touch-action: pan-y;
    }

    &.is-swipe-hint .nav-track {
      animation: island-swipe-hint-down 2.2s var(--ease-emphasized) 0.35s both;
    }
  }
}

.nav-track {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: var(--space-3);

  @include mobile {
    flex-direction: row;
    justify-content: center;
    gap: var(--island-gap);
    width: 100%;
  }
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--touch-target);
  min-width: var(--touch-target);
  height: var(--touch-target);
  padding: 0;
  border: none;
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  outline: none;
  box-sizing: border-box;
  transition:
    background var(--transition-standard),
    color var(--transition-standard);

  &:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--color-accent) 40%, transparent);
    outline-offset: 2px;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover:not(.active) {
      background: color-mix(in srgb, var(--color-accent) 7%, transparent);
      color: var(--color-text-primary);
    }
  }

  &.active,
  &.active:hover {
    color: var(--color-bg);
    background: var(--color-accent);
  }

  &:active {
    background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  }

  @include mobile {
    @include island-control;
  }
}

@media (horizontal-viewport-segments: 2) and (max-width: 767px) {
  .nav-island {
    inset-inline-start: calc(
      env(viewport-segment-left 0 0) + env(viewport-segment-width 0 0) / 2
    );
    inset-inline-end: auto;
    inline-size: fit-content;
    max-inline-size: calc(env(viewport-segment-width 0 0) - var(--space-6));
  }
}

@keyframes nav-fade-up {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(var(--space-5));
  }

  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes island-swipe-hint-down {
  0%,
  18%,
  100% {
    transform: translateY(0);
  }

  34% {
    transform: translateY(var(--space-3));
  }

  50% {
    transform: translateY(0);
  }

  66% {
    transform: translateY(var(--space-2));
  }

  82% {
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .nav-island {
    animation: none;
    transition: none;
  }

  .nav-island.is-swipe-hint .nav-track {
    animation: none;
  }
}

.icon-shell {
  display: inline-flex;
  flex: 0 0 var(--space-8);
  align-items: center;
  justify-content: center;
  width: var(--space-8);
  height: var(--space-8);
  border-radius: var(--radius-full);
  color: inherit;
  transition:
    background var(--transition-standard),
    color var(--transition-standard);

  svg {
    display: block;
    width: var(--space-5);
    height: var(--space-5);
  }

  @include mobile {
    flex-basis: var(--space-8);
    width: var(--space-8);
    height: var(--space-8);

    svg {
      width: var(--space-6);
      height: var(--space-6);
    }
  }
}
</style>
