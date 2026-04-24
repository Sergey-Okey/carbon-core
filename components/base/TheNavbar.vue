<template>
  <nav
    class="navbar"
    :class="{
      'is-expanded': showLabels,
      'is-mobile': isMobile,
    }"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div class="nav-items">
      <button
        v-for="item in navItems"
        :key="item.id"
        type="button"
        class="nav-item"
        :class="{ active: uiStore.activeNav === item.id }"
        :title="item.label"
        @click="handleNavClick(item.id)"
      >
        <component :is="item.icon" :size="20" />
        <Transition name="label-fade">
          <span v-if="showLabels" class="label">{{ item.label }}</span>
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
import { useUIStore } from '~/stores/ui.store'

const uiStore = useUIStore()
const route = useRoute()
const router = useRouter()

const navItems = [
  { id: 'board' as const, label: 'Доска', icon: LayoutGrid },
  { id: 'tasks' as const, label: 'Задачи', icon: CheckSquare },
  { id: 'shop' as const, label: 'Магазин', icon: ShoppingBag },
  { id: 'analytics' as const, label: 'Аналитика', icon: BarChart2 },
  { id: 'settings' as const, label: 'Настройки', icon: Settings },
]

const isMobile = ref(false)

function checkMobile() {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const showLabels = computed(() => !isMobile.value && uiStore.showLabels)

let hoverTimer: ReturnType<typeof setTimeout> | null = null

async function handleNavClick(section: (typeof navItems)[number]['id']) {
  uiStore.setActiveNav(section)

  if (route.path !== '/') {
    await router.push('/')
  }
}

function onMouseEnter() {
  if (isMobile.value) return
  if (hoverTimer) clearTimeout(hoverTimer)
  uiStore.setSidebarHovered(true)
}

function onMouseLeave() {
  if (isMobile.value) return
  if (hoverTimer) clearTimeout(hoverTimer)
  hoverTimer = setTimeout(() => {
    uiStore.setSidebarHovered(false)
  }, 200)
}
</script>

<style scoped lang="scss">
.navbar {
  --navbar-collapsed-width: 64px;
  --navbar-expanded-width: 180px;
  --navbar-margin: 12px;

  color: var(--accent);
  border: 1px solid var(--border);
  z-index: 100;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(12px);
  will-change: width;
  transition: width 0.3s cubic-bezier(0.2, 0, 0, 1);
  @include glass;

  position: fixed;
  bottom: var(--navbar-margin);
  left: 50%;
  transform: translateX(-50%);
  width: auto;
  height: auto;
  padding: 6px 12px;
  border-radius: 32px;
  display: inline-flex;

  @include desktop {
    position: relative;
    top: 0;
    bottom: 0;
    left: 0;
    right: auto;
    transform: none;
    width: var(--navbar-collapsed-width);
    height: fit-content;
    margin: auto var(--navbar-margin);
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    padding: 8px 0;
  }

  &.is-expanded {
    @include desktop {
      width: var(--navbar-expanded-width);
    }
  }
}

.nav-items {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 4px;

  @include desktop {
    flex-direction: column;
    gap: 2px;
    width: 100%;
  }
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-width: 44px;
  min-height: 44px;
  padding: 10px 12px;
  border: none;
  border-radius: var(--border-radius-md);
  background: transparent;
  color: var(--dim);
  cursor: pointer;
  white-space: nowrap;
  outline: none;
  transition: all var(--transition-standard);

  @include desktop {
    justify-content: flex-start;
    width: calc(100% - 12px);
    margin: 0 6px;
    padding: 10px 14px;
  }

  &:hover {
    background: var(--surface);
    color: var(--accent);
  }

  &.active {
    color: var(--accent);
    background: var(--surface);
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px var(--accent);
  }

  svg {
    stroke: currentColor;
    flex-shrink: 0;
  }
}

.label {
  font-size: 0.9rem;
  font-weight: 500;
  opacity: 1;
}

.label-fade-enter-active,
.label-fade-leave-active {
  transition: opacity 0.25s ease;
}

.label-fade-enter-from,
.label-fade-leave-to {
  opacity: 0;
}
</style>
