<template>
  <AppLaunchScreen />
  <NuxtLayout>
    <NuxtPage />
    <ConfirmDialog />
  </NuxtLayout>
  <CustomCursor />
  <SpeedInsights v-if="enableVercelAnalytics" />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { useDebounceFn } from '@vueuse/core'
import { SpeedInsights } from '@vercel/speed-insights/vue'
import CustomCursor from '~/components/base/CustomCursor.vue'
import AppLaunchScreen from '~/components/base/AppLaunchScreen.vue'
import ConfirmDialog from '~/components/ui/ConfirmDialog.vue'
import { useAuthStore } from '~/stores/auth.store'
import { useAccessStore } from '~/stores/access.store'
import { useBranchesStore } from '~/stores/branches.store'
import { useRewardsStore } from '~/stores/rewards.store'
import { useSettingsStore } from '~/stores/settings.store'
import { useTagsStore } from '~/stores/tags.store'
import { useTasksStore } from '~/stores/tasks.store'
import { useUIStore } from '~/stores/ui.store'
import { useUserStore } from '~/stores/user.store'
import { saveAutoBackup } from '~/utils/backup'
import { getBackendFetchOptions, getBackendUrl } from '~/utils/backend'
import { useSyncStatus } from '~/composables/useSyncStatus'

const tasksStore = useTasksStore()
const settingsStore = useSettingsStore()
const userStore = useUserStore()
const branchesStore = useBranchesStore()
const rewardsStore = useRewardsStore()
const tagsStore = useTagsStore()
const uiStore = useUIStore()
const authStore = useAuthStore()
const accessStore = useAccessStore()
const syncStatus = useSyncStatus()
const enableVercelAnalytics = useRuntimeConfig().public.enableVercelAnalytics
const syncEndpoint = getBackendUrl('/api/sync')
const syncUnsubscribers: Array<() => void> = []
let dailyResetTimer: number | null = null

type SyncResponse = {
  user?: Partial<typeof userStore.$state>
  tasks?: Partial<typeof tasksStore.$state>
  branches?: {
    branches?: typeof branchesStore.branches
    edges?: typeof branchesStore.edges
  }
  rewards?: Partial<typeof rewardsStore.$state>
  tags?: Partial<typeof tagsStore.$state>
  ui?: Partial<typeof uiStore.$state>
  settings?: Partial<typeof settingsStore.$state>
}

const userId = useState<string>('user-id', () => {
  if (process.client) {
    let id = localStorage.getItem('user-id') ?? ''
    if (!id) {
      id = uuidv4()
      localStorage.setItem('user-id', id)
    }
    return id
  }

  return 'server'
})

onMounted(async () => {
  await settingsStore.ready
  authStore.init()

  syncStatus.setRetry(() => void syncToCloud())
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  if (!navigator.onLine) syncStatus.setState('offline')

  if (accessStore.isDemo) {
    syncStatus.setState('local')
  } else try {
    syncStatus.setState('syncing')
    const data = (await $fetch(syncEndpoint, {
      query: { userId: userId.value },
      ...getBackendFetchOptions(),
    })) as SyncResponse
    if (data.user) userStore.$patch(data.user)
    if (data.tasks) tasksStore.$patch(data.tasks)
    if (data.branches?.branches) {
      branchesStore.$patch({ branches: data.branches.branches })
    }
    if (data.branches?.edges) branchesStore.replaceEdges(data.branches.edges)
    if (data.rewards) rewardsStore.$patch(data.rewards)
    if (data.tags) {
      tagsStore.$patch(data.tags)
      tagsStore.normalizeTags(tasksStore.tasks)
    }
    if (data.ui) uiStore.$patch(data.ui)
    if (data.settings) {
      settingsStore.$patch(data.settings)
      settingsStore.applyRuntimeSettings()
    }
    syncStatus.setState(authStore.authMode === 'local' ? 'local' : 'synced')
  } catch {
    syncStatus.setState(navigator.onLine ? 'error' : 'offline')
    console.warn(
      'Облачная синхронизация недоступна, используются локальные данные'
    )
  }

  tasksStore.resetDailyTasks()
  tagsStore.normalizeTags(tasksStore.tasks)
  scheduleNextReset()
  window.addEventListener('beforeunload', autoBackupOnUnload)

  // Store subscriptions capture edits and nested mutations without broad deep watchers.
  ;[userStore, tasksStore, branchesStore, rewardsStore, tagsStore, uiStore, settingsStore].forEach(
    (store) => {
      syncUnsubscribers.push(store.$subscribe(() => syncToCloud(), { detached: true }))
    }
  )
})

const syncToCloud = useDebounceFn(async () => {
  if (accessStore.isDemo) {
    syncStatus.setState('local')
    return
  }
  if (authStore.authMode === 'local') {
    syncStatus.setState('local')
    return
  }
  if (!navigator.onLine) {
    syncStatus.setState('offline')
    return
  }
  try {
    syncStatus.setState('syncing')
    await $fetch(syncEndpoint, {
      method: 'POST',
      ...getBackendFetchOptions(),
      body: {
        userId: userId.value,
        user: { ...userStore.$state },
        tasks: { ...tasksStore.$state },
        branches: { ...branchesStore.$state },
        rewards: { ...rewardsStore.$state },
        tags: { ...tagsStore.$state },
        ui: { ...uiStore.$state },
        settings: { ...settingsStore.$state },
      },
    })
    syncStatus.setState('synced')
  } catch {
    syncStatus.setState(navigator.onLine ? 'error' : 'offline')
  }
}, 2000)

onUnmounted(() => {
  window.removeEventListener('beforeunload', autoBackupOnUnload)
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
  if (dailyResetTimer !== null) window.clearTimeout(dailyResetTimer)
  syncUnsubscribers.splice(0).forEach((unsubscribe) => unsubscribe())
})

function handleOnline() {
  void syncToCloud()
}

function handleOffline() {
  syncStatus.setState('offline')
}

function scheduleNextReset() {
  const now = new Date()
  const next4AM = new Date(now)
  next4AM.setDate(now.getDate() + 1)
  next4AM.setHours(4, 0, 0, 0)

  dailyResetTimer = window.setTimeout(() => {
    tasksStore.resetDailyTasks()
    scheduleNextReset()
  }, next4AM.getTime() - now.getTime())
}

function autoBackupOnUnload() {
  if (accessStore.isDemo || !settingsStore.autoBackup) return
  saveAutoBackup()
  settingsStore.recordBackup()
}
</script>
