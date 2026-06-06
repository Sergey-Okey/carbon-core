<template>
  <NuxtLayout>
    <NuxtPage />
    <ConfirmDialog />
  </NuxtLayout>
  <CustomCursor />
  <SpeedInsights />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { useDebounceFn } from '@vueuse/core'
import { SpeedInsights } from '@vercel/speed-insights/vue'
import CustomCursor from '~/components/base/CustomCursor.vue'
import ConfirmDialog from '~/components/ui/ConfirmDialog.vue'
import { useAuthStore } from '~/stores/auth.store'
import { useBranchesStore } from '~/stores/branches.store'
import { useRewardsStore } from '~/stores/rewards.store'
import { useSettingsStore } from '~/stores/settings.store'
import { useTagsStore } from '~/stores/tags.store'
import { useTasksStore } from '~/stores/tasks.store'
import { useUIStore } from '~/stores/ui.store'
import { useUserStore } from '~/stores/user.store'
import { saveAutoBackup } from '~/utils/backup'

const tasksStore = useTasksStore()
const settingsStore = useSettingsStore()
const userStore = useUserStore()
const branchesStore = useBranchesStore()
const rewardsStore = useRewardsStore()
const tagsStore = useTagsStore()
const uiStore = useUIStore()
const authStore = useAuthStore()
const syncUnsubscribers: Array<() => void> = []

type SyncResponse = {
  user?: Partial<typeof userStore.$state>
  tasks?: typeof tasksStore.tasks
  branches?: typeof branchesStore.branches
  rewards?: typeof rewardsStore.rewards
  tags?: typeof tagsStore.tags
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

  try {
    const data = (await $fetch('/api/sync', {
      query: { userId: userId.value },
    })) as SyncResponse
    if (data.user) userStore.$patch(data.user)
    if (data.tasks) tasksStore.$patch({ tasks: data.tasks })
    if (data.branches) branchesStore.$patch({ branches: data.branches })
    if (data.rewards) rewardsStore.$patch({ rewards: data.rewards })
    if (data.tags) {
      tagsStore.$patch({ tags: data.tags })
      tagsStore.normalizeTags(tasksStore.tasks)
    }
    if (data.ui) uiStore.$patch(data.ui)
    if (data.settings) {
      settingsStore.$patch(data.settings)
      settingsStore.applyRuntimeSettings()
    }
  } catch {
    console.warn(
      'Облачная синхронизация недоступна, используются локальные данные'
    )
  }

  tasksStore.resetDailyTasks()
  tagsStore.normalizeTags(tasksStore.tasks)
  scheduleNextReset()
  window.addEventListener('beforeunload', autoBackupOnUnload)

  // Store subscriptions capture edits and nested mutations without broad deep watchers.
  ;[tasksStore, branchesStore, rewardsStore, tagsStore, uiStore, settingsStore].forEach(
    (store) => {
      syncUnsubscribers.push(store.$subscribe(() => syncToCloud(), { detached: true }))
    }
  )
})

const syncToCloud = useDebounceFn(async () => {
  try {
    await $fetch('/api/sync', {
      method: 'POST',
      body: {
        userId: userId.value,
        tasks: tasksStore.tasks,
        branches: branchesStore.branches,
        rewards: rewardsStore.rewards,
        tags: tagsStore.tags,
        ui: { ...uiStore.$state },
        settings: { ...settingsStore.$state },
      },
    })
  } catch {}
}, 2000)

onUnmounted(() => {
  window.removeEventListener('beforeunload', autoBackupOnUnload)
  syncUnsubscribers.splice(0).forEach((unsubscribe) => unsubscribe())
})

function scheduleNextReset() {
  const now = new Date()
  const next4AM = new Date(now)
  next4AM.setDate(now.getDate() + 1)
  next4AM.setHours(4, 0, 0, 0)

  setTimeout(() => {
    tasksStore.resetDailyTasks()
    scheduleNextReset()
  }, next4AM.getTime() - now.getTime())
}

function autoBackupOnUnload() {
  if (!settingsStore.autoBackup) return
  saveAutoBackup()
  settingsStore.recordBackup()
}
</script>
