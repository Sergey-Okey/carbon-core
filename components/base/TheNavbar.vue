<template>
  <nav
    class="nav-island"
    :class="{ 'is-mobile': isMobile }"
    aria-label="Основная навигация"
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
        :data-tooltip="item.label"
        :data-tour="`nav-${item.id}`"
        data-tooltip-position="right"
        @click="handleNavClick(item.id)"
      >
        <span class="icon-shell">
          <component :is="item.icon" :size="isMobile ? 20 : 18" />
        </span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import {
  BarChart2,
  CheckSquare,
  LayoutGrid,
  Settings,
  Timer,
} from 'lucide-vue-next'
import { useUIStore, type NavSection } from '~/stores/ui.store'
import { useGuidedTourStore } from '~/stores/guidedTour.store'

const uiStore = useUIStore()
const guidedTour = useGuidedTourStore()
const route = useRoute()
const router = useRouter()

const navItems: { id: NavSection; label: string; icon: any }[] = [
  { id: 'board', label: 'Доска', icon: LayoutGrid },
  { id: 'tasks', label: 'Задачи', icon: CheckSquare },
  { id: 'shop', label: 'Фокус', icon: Timer },
  { id: 'analytics', label: 'Аналитика', icon: BarChart2 },
  { id: 'settings', label: 'Настройки', icon: Settings },
]

const isMobile = ref(false)

function checkMobile() {
  isMobile.value = window.innerWidth < 768
  uiStore.setSidebarHovered(false)
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

async function handleNavClick(section: NavSection) {
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
    inline-size: 56px;
    margin-block: 0;
    margin-inline: auto;
    padding-block: var(--space-2);
    border: var(--ui-border);
  }

  @include mobile {
    position: fixed;
    inset-inline-start: 50%;
    inset-block-end: calc(env(safe-area-inset-bottom, 0px) + var(--space-3));
    inline-size: auto;
    max-inline-size: calc(100dvw - var(--space-6) - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px));
    padding-block: var(--space-2);
    padding-inline: var(--space-3);
    transform: translateX(-50%);
    border-radius: var(--radius-full);
  }
}

.nav-track {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: var(--space-2);

  @include mobile {
    flex-direction: row;
    justify-content: center;
    gap: var(--space-2);
  }
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--space-10);
  min-width: var(--space-10);
  height: var(--space-10);
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
    width: var(--space-11);
    min-width: var(--space-11);
    height: var(--space-11);
  }
}

@media (horizontal-viewport-segments: 2) and (max-width: 767px) {
  .nav-island {
    inset-inline-start: calc(env(viewport-segment-left 0 0) + (env(viewport-segment-width 0 0) / 2));
    max-inline-size: calc(env(viewport-segment-width 0 0) - var(--space-6));
  }
}

.icon-shell {
  display: inline-flex;
  flex: 0 0 28px;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  color: inherit;
  transition:
    background var(--transition-standard),
    color var(--transition-standard);

  svg {
    display: block;
    width: 18px;
    height: 18px;
  }
}
</style>
