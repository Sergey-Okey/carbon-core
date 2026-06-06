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
  @include glass;
  position: relative;
  overflow: visible;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  color: var(--text);
  border-radius: var(--border-radius-pill);
  background: transparent;
  transition:
    border-color var(--transition-standard),
    background var(--transition-standard);

  @include desktop {
    align-self: center;
    inline-size: 56px;
    margin-block: 0;
    margin-inline: auto;
    padding-block: 10px;
    border: var(--ui-border);
  }

  @include mobile {
    position: fixed;
    inset-inline-start: 50%;
    inset-block-end: calc(env(safe-area-inset-bottom, 0px) + 14px);
    inline-size: auto;
    max-inline-size: calc(100dvw - 24px - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px));
    padding-block: 10px;
    padding-inline: 13px;
    transform: translateX(-50%);
    border-radius: var(--border-radius-pill);
    backdrop-filter: var(--glass-strong-filter);
    -webkit-backdrop-filter: var(--glass-strong-filter);
  }
}

.nav-track {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 10px;

  @include mobile {
    flex-direction: row;
    justify-content: center;
    gap: 10px;
  }
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  min-width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--dim);
  cursor: pointer;
  outline: none;
  box-sizing: border-box;
  transition:
    background var(--transition-standard),
    color var(--transition-standard);

  @media (hover: hover) and (pointer: fine) {
    &:hover:not(.active) {
      background: color-mix(in srgb, var(--accent) 7%, transparent);
      color: var(--text);
    }
  }

  &.active,
  &.active:hover {
    color: var(--bg);
    background: var(--accent);
  }

  &:active {
    background: color-mix(in srgb, var(--accent) 8%, transparent);
  }

  @include mobile {
    width: 44px;
    min-width: 44px;
    height: 44px;
  }
}

@media (horizontal-viewport-segments: 2) and (max-width: 767px) {
  .nav-island {
    inset-inline-start: calc(env(viewport-segment-left 0 0) + (env(viewport-segment-width 0 0) / 2));
    max-inline-size: calc(env(viewport-segment-width 0 0) - 24px);
  }
}

.icon-shell {
  display: inline-flex;
  flex: 0 0 28px;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
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
