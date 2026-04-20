<template>
  <NuxtLayout v-if="ready">
    <NuxtPage />
    <ConfirmDialog />
  </NuxtLayout>
  <SpeedInsights />
</template>

<script setup lang="ts">
import { useTasksStore } from '~/stores/tasks.store'
import { useSettingsStore } from '~/stores/settings.store'
import { useUserStore } from '~/stores/user.store'
import { useBranchesStore } from '~/stores/branches.store'
import { useRewardsStore } from '~/stores/rewards.store'
import { useTagsStore } from '~/stores/tags.store'
import { useUIStore } from '~/stores/ui.store'
import ConfirmDialog from '~/components/ui/ConfirmDialog.vue'
import { SpeedInsights } from '@vercel/speed-insights/vue'
import { watch, onMounted, onUnmounted, ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { v4 as uuidv4 } from 'uuid'

const tasksStore = useTasksStore()
const settingsStore = useSettingsStore()
const userStore = useUserStore()
const branchesStore = useBranchesStore()
const rewardsStore = useRewardsStore()
const tagsStore = useTagsStore()
const uiStore = useUIStore()

const userId = useState<string>('user-id', () => {
  if (process.client) {
    let id = localStorage.getItem('user-id')
    if (!id) {
      id = uuidv4() // Заменили crypto.randomUUID() на uuidv4()
      localStorage.setItem('user-id', id)
    }
    return id
  }
  return 'server'
})

const ready = ref(false)

onMounted(async () => {
  await settingsStore.ready

  try {
    const data = await $fetch('/api/sync', { query: { userId: userId.value } })
    if (data.user) userStore.$patch(data.user)
    if (data.tasks) tasksStore.$patch({ tasks: data.tasks })
    if (data.branches) branchesStore.$patch({ branches: data.branches })
    if (data.rewards) rewardsStore.$patch({ rewards: data.rewards })
    if (data.tags) tagsStore.$patch({ tags: data.tags })
    if (data.ui) uiStore.$patch(data.ui)
    if (data.settings) settingsStore.$patch(data.settings)
  } catch (e) {
    console.warn(
      'Облачная синхронизация недоступна, используются локальные данные'
    )
  }

  const hasSeenOnboarding = localStorage.getItem('carbon-onboarding')
  if (!hasSeenOnboarding) {
    await navigateTo('/onboarding')
  }

  ready.value = true

  tasksStore.resetDailyTasks()
  scheduleNextReset()
  window.addEventListener('beforeunload', autoBackupOnUnload)
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

watch(
  [
    () => tasksStore.tasks,
    () => branchesStore.branches,
    () => rewardsStore.rewards,
    () => tagsStore.tags,
    () => uiStore.$state,
    () => settingsStore.$state,
  ],
  () => syncToCloud(),
  { deep: true }
)

onUnmounted(() => {
  window.removeEventListener('beforeunload', autoBackupOnUnload)
})

function scheduleNextReset() {
  const now = new Date()
  const next4AM = new Date(now)
  next4AM.setDate(now.getDate() + 1)
  next4AM.setHours(4, 0, 0, 0)
  const ms = next4AM.getTime() - now.getTime()

  setTimeout(() => {
    tasksStore.resetDailyTasks()
    scheduleNextReset()
  }, ms)
}

function autoBackupOnUnload() {
  if (settingsStore.autoBackup) {
    const data = {
      tasks: tasksStore.tasks,
      branches: branchesStore.branches,
      rewards: rewardsStore.rewards,
      tags: tagsStore.tags,
      ui: uiStore.$state,
      settings: settingsStore.$state,
    }
    localStorage.setItem('cof-autobackup-latest', JSON.stringify(data))
    settingsStore.recordBackup()
  }
}
</script>
