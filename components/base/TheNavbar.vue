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
        <component :is="item.icon" :size="isMobile ? 24 : 20" class="nav-icon" />
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
  color: var(--accent);
  z-index: 100;
  overflow: hidden;
  will-change: width;
  transition: width 0.3s cubic-bezier(0.2, 0, 0, 1);
  @include glass;

  /* Десктоп (без изменений) */
  @include desktop {
    position: relative;
    top: 0;
    bottom: 0;
    left: 0;
    right: auto;
    transform: none;
    width: 64px;
    height: fit-content;
    margin: auto 12px;
    border-radius: var(--border-radius-lg);
    display: flex;
    flex-direction: column;
    padding: 8px 0;

    &.is-expanded {
      width: 180px;
    }

    &:not(.is-expanded) {
      .nav-item {
        width: 44px;
        min-width: 44px;
        height: 44px;
        padding: 0;
        justify-content: center;
        border-radius: 50%;
        gap: 0;
      }
    }
  }

  /* Мобильная версия — компактнее островок */
  @include mobile {
    @include glass;
    position: fixed;
    bottom: 16px;
    left: 12px;
    right: 12px;
    width: auto;
    padding: 8px 10px;
    border-radius: var(--border-radius-pill);
    animation: slideUp 0.3s ease-out;
    transition: transform 0.2s, box-shadow 0.2s;

    &:active {
      transform: scale(0.98);
    }
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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

  @include mobile {
    flex-direction: row;
    justify-content: space-around;
    gap: 6px;
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
    border: 1px solid transparent;
  border-radius: var(--border-radius-md);
    background: var(--glass-surface);
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
    border-radius: var(--border-radius-pill);
  }

  @include mobile {
    flex: 0;
    width: 42px;
    min-width: 42px;
    min-height: 42px;
    justify-content: center;
    padding: 0;
    border-radius: 50%;
  }

  &:hover {
    color: var(--accent);
    border-color: color-mix(in srgb, var(--accent) 20%, transparent);
    background: color-mix(in srgb, var(--accent) 8%, transparent);
  }

  &:active {
    transform: scale(0.96);
  }

  &.active {
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 16%, var(--glass-surface));
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px var(--accent);
  }
}

.nav-icon {
  stroke: currentColor;
  flex-shrink: 0;
  transition: transform 0.2s ease;

  @include desktop {
    .nav-item:hover & {
      transform: scale(1.08);
    }
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
