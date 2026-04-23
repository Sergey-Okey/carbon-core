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
        class="nav-item"
        :class="{ active: uiStore.activeNav === item.id }"
        @click="uiStore.setActiveNav(item.id)"
        :title="!showLabels ? item.label : ''"
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
import { ref, onMounted, onUnmounted, computed } from 'vue'
import {
  LayoutGrid,
  CheckSquare,
  ShoppingBag,
  BarChart2,
  Settings,
} from 'lucide-vue-next'
import { useUIStore } from '~/stores/ui.store'

const uiStore = useUIStore()

const navItems = [
  { id: 'board' as const, label: 'Доска', icon: LayoutGrid },
  { id: 'tasks' as const, label: 'Задачи', icon: CheckSquare },
  { id: 'shop' as const, label: 'Магазин', icon: ShoppingBag },
  { id: 'analytics' as const, label: 'Аналитика', icon: BarChart2 },
  { id: 'settings' as const, label: 'Настройки', icon: Settings },
]

const isMobile = ref(false)
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})
onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const showLabels = computed(() => {
  return !isMobile.value && uiStore.showLabels
})

let hoverTimer: ReturnType<typeof setTimeout> | null = null
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

  @include glass;
  color: var(--accent);
  border: 1px solid var(--border);
  z-index: 100;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(12px);
  will-change: width;
  transition: width 0.3s cubic-bezier(0.2, 0, 0, 1);

  // Мобильная версия: компактный островок внизу
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
    margin: auto var(--navbar-margin); // центрирование по вертикали
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
    padding: 10px 12px;
    border-radius: var(--border-radius-md);
    color: var(--dim);
    transition: all var(--transition-standard);
    white-space: nowrap;
    background: transparent;
    border: none;
    cursor: pointer;
    min-width: 44px;
    min-height: 44px;

    @include desktop {
      justify-content: flex-start;
      padding: 10px 14px;
      margin: 0 6px;
      width: calc(100% - 12px);
    }

    &:hover {
      background: var(--surface);
      color: var(--accent);
    }

    &.active {
      color: var(--accent);
      background: var(--surface);
    }

    svg {
      stroke: currentColor;
      flex-shrink: 0;
    }

    .label {
      font-size: 0.9rem;
      font-weight: 500;
      opacity: 1;
    }
  }
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
