import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { accessAwareStorage } from '~/utils/accessStorage'

export type NavSection = 'board' | 'tasks' | 'shop' | 'analytics' | 'settings'

export const useUIStore = defineStore(
  'ui',
  () => {
    const activeNav = ref<NavSection>('board')
    const sidebarCollapsed = ref(true)
    const sidebarHovered = ref(false)

    function setActiveNav(section: NavSection) {
      activeNav.value = section
    }

    function toggleSidebar() {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }

    function setSidebarHovered(value: boolean) {
      sidebarHovered.value = value
    }

    const showLabels = computed(
      () => !sidebarCollapsed.value || sidebarHovered.value
    )

    const panelWidth = computed(() => (sidebarCollapsed.value ? 72 : 240))

    return {
      activeNav,
      sidebarCollapsed,
      sidebarHovered,
      showLabels,
      panelWidth,
      setActiveNav,
      toggleSidebar,
      setSidebarHovered,
    }
  },
  {
    persist: import.meta.client
      ? { key: 'carbon-ui', storage: accessAwareStorage }
      : undefined,
  }
)
