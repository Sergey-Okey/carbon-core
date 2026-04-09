import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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

    return {
      activeNav,
      sidebarCollapsed,
      sidebarHovered,
      showLabels,
      setActiveNav,
      toggleSidebar,
      setSidebarHovered,
    }
  },
  {
    persist: {
      key: 'carbon-ui',
      storage: localStorage,
    },
  }
)
