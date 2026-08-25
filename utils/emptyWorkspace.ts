import { useAiStore } from '~/stores/ai.store'
import { useBranchesStore } from '~/stores/branches.store'
import { useNotificationsStore } from '~/stores/notifications.store'
import { useRewardsStore } from '~/stores/rewards.store'
import { ACCENT_COLORS, useSettingsStore } from '~/stores/settings.store'
import { useTagsStore } from '~/stores/tags.store'
import { useTasksStore } from '~/stores/tasks.store'
import { DEFAULT_ANALYTICS_WIDGET_ORDER, useUIStore } from '~/stores/ui.store'
import { useUserStore } from '~/stores/user.store'

type PersistableStore = {
  $persist?: () => void
}

function persistableStores(): PersistableStore[] {
  return [
    useTasksStore(),
    useBranchesStore(),
    useRewardsStore(),
    useTagsStore(),
    useUserStore(),
    useAiStore(),
    useNotificationsStore(),
    useUIStore(),
    useSettingsStore(),
  ]
}

/** Empty in-memory workspace so persist cannot rewrite demo data after a wipe. */
export function emptyWorkspaceStores(options: { includePrefs?: boolean } = {}) {
  if (!import.meta.client) return

  useTasksStore().$patch({
    tasks: [],
    deletedTasks: [],
    completedTasksHistory: [],
    completionLog: [],
  })
  useRewardsStore().$patch({ rewards: [] })
  useTagsStore().$patch({ tags: [] })

  const userStore = useUserStore()
  userStore.$patch({
    leaguePoints: 0,
    completedTasksCount: 0,
  })
  userStore.resetProfile()

  const branchesStore = useBranchesStore()
  branchesStore.$patch({ branches: [] })
  branchesStore.replaceEdges([])

  useAiStore().$patch({ memory: [], lastMessage: '' })
  useNotificationsStore().clearInbox()

  if (options.includePrefs) {
    useUIStore().$patch({
      activeNav: 'board',
      sidebarCollapsed: true,
      analyticsWidgetOrder: [...DEFAULT_ANALYTICS_WIDGET_ORDER],
      analyticsRangeDays: 14,
    })
    const settingsStore = useSettingsStore()
    settingsStore.$patch({
      theme: 'dark',
      themeMode: 'dark',
      lightThemeFrom: '08:00',
      darkThemeFrom: '20:00',
      accentColor: ACCENT_COLORS[0].value,
      uiDensity: 'comfortable',
      appBackgroundMode: 'default',
      customBackgroundImage: '',
      backgroundIntensity: 'normal',
      animationsEnabled: true,
      animationSpeed: 1,
      soundEnabled: true,
      soundVolume: 0.65,
      hapticsEnabled: true,
      notificationsEnabled: true,
      toastDuration: 4,
      showSettingsStats: false,
      showTopStats: true,
      confirmDangerActions: true,
      autoBackup: true,
      lastBackupDate: null,
      boardConfirmEdgeDelete: true,
      boardConfirmBranchDelete: true,
      boardLayoutDensity: 'normal',
      boardColumns: 4,
      boardShowNodeTypes: true,
    })
    settingsStore.applyRuntimeSettings()
  }
}

export function persistWorkspaceStores() {
  if (!import.meta.client) return

  for (const store of persistableStores()) {
    store.$persist?.()
  }
}
