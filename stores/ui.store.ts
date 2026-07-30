import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { accessAwareStorage } from '~/utils/accessStorage'

export type NavSection = 'board' | 'tasks' | 'shop' | 'analytics' | 'settings'

export type NavTarget =
  | { kind: 'task'; id: string }
  | { kind: 'branch'; id: string }
  | { kind: 'milestone'; id: string }

export const ANALYTICS_WIDGET_IDS = [
  'activity',
  'hours',
  'focus',
  'categories',
  'radar',
  'habits',
  'heatmap',
  'tags',
] as const

export type AnalyticsWidgetId = (typeof ANALYTICS_WIDGET_IDS)[number]

export const DEFAULT_ANALYTICS_WIDGET_ORDER: AnalyticsWidgetId[] = [...ANALYTICS_WIDGET_IDS]

function normalizeAnalyticsWidgetOrder(order: unknown): AnalyticsWidgetId[] {
  const allowed = new Set<string>(ANALYTICS_WIDGET_IDS)
  const incoming = Array.isArray(order)
    ? order.filter((id): id is AnalyticsWidgetId => typeof id === 'string' && allowed.has(id))
    : []
  const unique = [...new Set(incoming)]
  for (const id of ANALYTICS_WIDGET_IDS) {
    if (!unique.includes(id)) unique.push(id)
  }
  return unique
}

export const useUIStore = defineStore(
  'ui',
  () => {
    const activeNav = ref<NavSection>('board')
    const sidebarCollapsed = ref(true)
    const sidebarHovered = ref(false)
    const analyticsWidgetOrder = ref<AnalyticsWidgetId[]>([...DEFAULT_ANALYTICS_WIDGET_ORDER])
    const analyticsRangeDays = ref<7 | 14 | 30>(14)
    const pendingNavTarget = ref<NavTarget | null>(null)

    function setActiveNav(section: NavSection) {
      activeNav.value = section
    }

    function navigateToTarget(target: NavTarget) {
      pendingNavTarget.value = target
      if (target.kind === 'task') {
        activeNav.value = 'tasks'
      } else {
        activeNav.value = 'board'
      }
    }

    function clearPendingNavTarget() {
      pendingNavTarget.value = null
    }

    function toggleSidebar() {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }

    function setSidebarHovered(value: boolean) {
      sidebarHovered.value = value
    }

    function setAnalyticsWidgetOrder(order: AnalyticsWidgetId[]) {
      analyticsWidgetOrder.value = normalizeAnalyticsWidgetOrder(order)
    }

    function swapAnalyticsWidgets(sourceId: AnalyticsWidgetId, targetId: AnalyticsWidgetId) {
      if (sourceId === targetId) return
      const next = [...analyticsWidgetOrder.value]
      const from = next.indexOf(sourceId)
      const to = next.indexOf(targetId)
      if (from < 0 || to < 0) return
      ;[next[from], next[to]] = [next[to], next[from]]
      analyticsWidgetOrder.value = next
    }

    function setAnalyticsRangeDays(days: 7 | 14 | 30) {
      analyticsRangeDays.value = days
    }

    const showLabels = computed(
      () => !sidebarCollapsed.value || sidebarHovered.value
    )

    const panelWidth = computed(() => (sidebarCollapsed.value ? 72 : 240))

    return {
      activeNav,
      sidebarCollapsed,
      sidebarHovered,
      analyticsWidgetOrder,
      analyticsRangeDays,
      pendingNavTarget,
      showLabels,
      panelWidth,
      setActiveNav,
      navigateToTarget,
      clearPendingNavTarget,
      toggleSidebar,
      setSidebarHovered,
      setAnalyticsWidgetOrder,
      setAnalyticsRangeDays,
      swapAnalyticsWidgets,
    }
  },
  {
    persist: import.meta.client
      ? {
          key: 'carbon-ui',
          storage: accessAwareStorage,
          afterHydrate: (ctx) => {
            const store = ctx.store as ReturnType<typeof useUIStore>
            store.analyticsWidgetOrder = normalizeAnalyticsWidgetOrder(store.analyticsWidgetOrder)
            if (![7, 14, 30].includes(store.analyticsRangeDays)) {
              store.analyticsRangeDays = 14
            }
          },
        }
      : undefined,
  }
)
