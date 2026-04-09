<template>
  <nav
    class="navbar"
    :class="{
      'is-expanded': uiStore.showLabels,
      'is-mobile': isMobile,
    }"
    @mouseenter="uiStore.setSidebarHovered(true)"
    @mouseleave="uiStore.setSidebarHovered(false)"
  >
    <div class="nav-items">
      <button
        v-for="item in navItems"
        :key="item.id"
        class="nav-item"
        :class="{ active: uiStore.activeNav === item.id }"
        @click="uiStore.setActiveNav(item.id)"
      >
        <component :is="item.icon" :size="24" />
        <Transition name="fade">
          <span class="label" v-if="uiStore.showLabels">{{ item.label }}</span>
        </Transition>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
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
</script>

<style scoped lang="scss">
.navbar {
  --navbar-collapsed-width: 72px;
  --navbar-expanded-width: 200px;

  // Стеклянный эффект
  border: 1px solid var(--border);
  @include glass;
  color: var(--accent);
  transition: width 0.3s cubic-bezier(0.2, 0, 0, 1), border-radius 0.3s ease;
  overflow: hidden;
  z-index: 100;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2);
  margin-top: auto;
  margin-bottom: auto;
  // Мобильная версия (фиксированная нижняя панель)
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 72px;
  border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;

  @include desktop {
    position: relative;
    top: 0;
    bottom: auto;
    left: 0;
    right: auto;
    width: var(--navbar-collapsed-width);
    height: 100%;
    border-radius: 0 var(--border-radius-lg) var(--border-radius-lg) 0;
    box-shadow: none;
    transition: width 0.25s ease, border-radius 0.25s ease;
  }

  // Расширенное состояние (показываем подписи)
  &.is-expanded {
    @include desktop {
      width: var(--navbar-expanded-width);
      border-radius: 0 var(--border-radius-lg) var(--border-radius-lg) 0;
    }
  }

  .nav-items {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    height: 100%; // Исправлено: было 100vh
    padding: 8px 0;

    @include desktop {
      flex-direction: column;
      justify-content: center; // Центрируем по вертикали
      gap: 8px;
      padding: 16px 0;
      align-items: stretch;
    }
  }

  .nav-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 12px;
    border-radius: var(--border-radius-md);
    color: var(--dim);
    transition: all var(--transition-standard);
    white-space: nowrap;
    background: transparent;
    border: none;
    cursor: pointer;

    @include desktop {
      justify-content: flex-start;
      padding: 12px 16px;
      margin: 0 8px;
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
    }
  }
}

// Анимация появления/исчезновения текста
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
