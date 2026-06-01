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
          <component :is="item.icon" :size="isMobile ? 20 : 18" />
        </span>

        <Transition name="label">
          <span v-if="showLabels" class="nav-label">{{ item.label }}</span>
        </Transition>
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
  flex-shrink: 0;
  align-self: center;
  z-index: 100;
  color: var(--accent);
  border-radius: var(--border-radius-pill);
  backdrop-filter: blur(12px);
  transition:
    width 0.32s cubic-bezier(0.2, 0, 0, 1),
    transform var(--transition-standard),
    border-color var(--transition-standard),
    background var(--transition-standard);

  @include desktop {
    width: 56px;
    margin: auto 12px;
    padding: 8px 0;

    &.is-expanded {
      width: 180px;
      border-radius: var(--border-radius-lg);
    }
  }

  @include mobile {
    position: fixed;
    left: 50%;
    bottom: calc(env(safe-area-inset-bottom, 0px) + 16px);
    width: auto;
    max-width: calc(100vw - 32px);
    padding: 6px 12px;
    transform: translateX(-50%);
    backdrop-filter: blur(16px);
  }
}

.nav-track {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;

  @include desktop {
    flex-direction: column;
    gap: 6px;
  }

  @include mobile {
    flex-direction: row;
    gap: 8px;
  }
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  width: auto;
  min-width: 40px;
  height: 40px;
  padding: 6px 8px;
  border: 1px solid transparent;
  border-radius: var(--border-radius-pill);
  background: transparent;
  color: var(--dim);
  cursor: pointer;
  outline: none;
  white-space: nowrap;
  transition:
    all var(--transition-standard),
    transform 0.12s ease;

  @include desktop {
    width: 40px;
    justify-content: center;
    padding: 6px;

    .is-expanded & {
      width: 100%;
      justify-content: flex-start;
      padding: 6px 12px;
    }
  }

  @include mobile {
    width: 44px;
    height: 44px;
    justify-content: center;
    padding: 6px;
  }

  &:hover,
  &:focus-visible {
    color: var(--accent);
    background: color-mix(in srgb, var(--surface) 60%, transparent);
  }

  &:active {
    transform: scale(0.96);
  }

  &.active {
    color: var(--bg);
    background: var(--accent);
    border-color: var(--accent);
    box-shadow: var(--shadow-sm);
  }
}

.icon-shell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: inherit;
  transition: background 0.2s;

  .nav-item:active & {
    transform: scale(0.96);
  }

  svg {
    display: block;
    stroke: currentColor;
    stroke-width: 2.5; 
  }
}

.nav-label {
  overflow: hidden;
  color: inherit;
  font-size: 0.85rem;
  font-weight: 500;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.label-enter-active,
.label-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.label-enter-from,
.label-leave-to {
  opacity: 0;
  transform: translateX(-6px);
}
</style>