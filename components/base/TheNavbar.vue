<template>
  <nav
    class="nav-island"
    :class="{ 'is-expanded': showLabels, 'is-mobile': isMobile }"
    aria-label="Основная навигация"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div class="nav-track">
      <button
        v-for="item in navItems"
        :key="item.id"
        type="button"
        class="nav-item"
        :class="{ active: uiStore.activeNav === item.id }"
        :title="item.label"
        :aria-label="item.label"
        :aria-current="uiStore.activeNav === item.id ? 'page' : undefined"
        @click="handleNavClick(item.id)"
      >
        <span class="icon-shell">
          <component :is="item.icon" :size="isMobile ? 16 : 18" />
        </span>

        <span class="nav-label" :class="{ 'is-visible': showLabels }">
          {{ item.label }}
        </span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
  BarChart2,
  CheckSquare,
  LayoutGrid,
  Settings,
  ShoppingBag,
} from 'lucide-vue-next'
import { useUIStore, type NavSection } from '~/stores/ui.store'

const uiStore = useUIStore()
const route = useRoute()
const router = useRouter()

const navItems: { id: NavSection; label: string; icon: any }[] = [
  { id: 'board', label: 'Доска', icon: LayoutGrid },
  { id: 'tasks', label: 'Задачи', icon: CheckSquare },
  { id: 'shop', label: 'Магазин', icon: ShoppingBag },
  { id: 'analytics', label: 'Аналитика', icon: BarChart2 },
  { id: 'settings', label: 'Настройки', icon: Settings },
]

const isMobile = ref(false)
let closeTimer: ReturnType<typeof setTimeout> | null = null

const showLabels = computed(() => !isMobile.value && uiStore.showLabels)

function checkMobile() {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) uiStore.setSidebarHovered(false)
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  if (closeTimer) clearTimeout(closeTimer)
})

async function handleNavClick(section: NavSection) {
  uiStore.setActiveNav(section)

  if (route.path !== '/') {
    await router.push('/')
  }
}

function onMouseEnter() {
  if (isMobile.value) return
  if (closeTimer) clearTimeout(closeTimer)
  uiStore.setSidebarHovered(true)
}

function onMouseLeave() {
  if (isMobile.value) return
  if (closeTimer) clearTimeout(closeTimer)
  closeTimer = setTimeout(() => uiStore.setSidebarHovered(false), 140)
}
</script>

<style scoped lang="scss">
.nav-island {
  @include glass;
  position: relative;
  overflow: hidden;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  color: var(--accent);
  border-radius: var(--border-radius-pill);
  background: transparent;
  transition:
    width 0.32s cubic-bezier(0.2, 0, 0, 1),
    border-color var(--transition-standard),
    background var(--transition-standard),
    box-shadow var(--transition-standard);

  @include desktop {
    align-self: center;
    width: 56px;
    margin: 0 auto;
    padding: 10px 0;
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: var(--shadow-sm);

    &.is-expanded {
      width: 198px;
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-md);
    }
  }

  @include mobile {
    position: fixed;
    left: 50%;
    bottom: calc(env(safe-area-inset-bottom, 0px) + 12px);
    width: auto;
    max-width: calc(100vw - 24px);
    padding: 8px 10px;
    transform: translateX(-50%);
    border-radius: 999px;
    box-shadow: var(--shadow-md);
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
    gap: 8px;
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
  white-space: nowrap;
  overflow: hidden;
  box-sizing: border-box;
  transition:
    width 0.32s cubic-bezier(0.25, 0.1, 0.25, 1),
    padding 0.32s cubic-bezier(0.25, 0.1, 0.25, 1),
    background var(--transition-standard),
    color var(--transition-standard),
    border-radius 0.32s ease,
    box-shadow var(--transition-standard);

  &.active {
    color: var(--bg);
    background: var(--accent);
    box-shadow: var(--shadow-sm);
  }

  @include desktop {
    .is-expanded & {
      width: calc(100% - 28px);
      justify-content: flex-start;
      padding: 0 14px;
      border-radius: var(--border-radius-pill);
    }
  }

  @include mobile {
    width: 36px;
    min-width: 36px;
    height: 36px;
    justify-content: center;
  }

  &:active {
    transform: scale(0.96);
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
  transition: transform 0.2s ease, background 0.2s ease;

  .nav-item:active & {
    transform: scale(0.96);
  }

  svg {
    display: block;
    width: 18px;
    height: 18px;
  }
}

.nav-label {
  display: inline-flex;
  overflow: hidden;
  max-width: 0;
  opacity: 0;
  margin-left: 0;
  font-size: 0.85rem;
  font-weight: 500;
  line-height: 1.2;
  color: inherit;
  white-space: nowrap;
  transition:
    max-width 0.28s ease,
    opacity 0.28s ease,
    margin-left 0.28s ease;
  pointer-events: none;
}

.nav-island.is-expanded .nav-label.is-visible {
  max-width: 120px;
  opacity: 1;
  margin-left: 10px;
}
</style>