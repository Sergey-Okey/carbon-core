<template>
  <NuxtLayout>
    <NuxtPage />
    <ConfirmDialog />
  </NuxtLayout>
  <!-- 👇 Компонент Analytics -->
  <Analytics />
  <!-- 👇 Компонент Speed Insights -->
  <SpeedInsights />
</template>

<script setup lang="ts">
import { useTasksStore } from '~/stores/tasks.store'
import { useSettingsStore } from '~/stores/settings.store'
import { useOnboardingStore } from '~/stores/onboarding.store'
import { useUserStore } from '~/stores/user.store'
import { useBranchesStore } from '~/stores/branches.store'
import { useRewardsStore } from '~/stores/rewards.store'
import { useTagsStore } from '~/stores/tags.store'
import { useUIStore } from '~/stores/ui.store'
import ConfirmDialog from '~/components/ui/ConfirmDialog.vue'
import { SpeedInsights } from '@vercel/speed-insights/vue'
import { Analytics } from '@vercel/analytics/vue'
import { watch, onMounted, onUnmounted, ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'

const tasksStore = useTasksStore()
const settingsStore = useSettingsStore()
const onboardingStore = useOnboardingStore()
const userStore = useUserStore()
const branchesStore = useBranchesStore()
const rewardsStore = useRewardsStore()
const tagsStore = useTagsStore()
const uiStore = useUIStore()

await settingsStore.ready

const userId = ref<string>('default-user')

async function loadFromCloud() {
  try {
    const data = await $fetch('/api/sync', { query: { userId: userId.value } })
    if (data.user) userStore.$patch({ ...data.user })
    if (data.tasks) tasksStore.$patch({ tasks: data.tasks })
    if (data.branches) branchesStore.$patch({ branches: data.branches })
    if (data.rewards) rewardsStore.$patch({ rewards: data.rewards })
    if (data.tags) tagsStore.$patch({ tags: data.tags })
    if (data.ui) uiStore.$patch({ ...data.ui })
    if (data.settings) settingsStore.$patch({ ...data.settings })
  } catch (e) {
    console.warn(
      'Облачная синхронизация недоступна, используются локальные данные'
    )
  }
}

const syncToCloud = useDebounceFn(async () => {
  try {
    await $fetch('/api/sync', {
      method: 'POST',
      body: {
        userId: userId.value,
        user: { ...userStore.$state },
        tasks: tasksStore.tasks,
        branches: branchesStore.branches,
        rewards: rewardsStore.rewards,
        tags: tagsStore.tags,
        ui: { ...uiStore.$state },
        settings: { ...settingsStore.$state },
      },
    })
  } catch (e) {
    console.warn('Ошибка синхронизации с облаком')
  }
}, 2000)

watch(
  [
    () => userStore.$state,
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

if (!onboardingStore.hasSeenOnboarding && import.meta.client) {
  const route = useRoute()
  if (route.path !== '/onboarding') {
    await navigateTo('/onboarding')
  }
}

onMounted(async () => {
  await loadFromCloud()
  tasksStore.resetDailyTasks()
  scheduleNextReset()
  window.addEventListener('beforeunload', autoBackupOnUnload)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', autoBackupOnUnload)
})

function scheduleNextReset() {
  const now = new Date()
  const next4AM = new Date(now)
  next4AM.setDate(now.getDate() + 1)
  next4AM.setHours(4, 0, 0, 0)
  const msUntil4AM = next4AM.getTime() - now.getTime()

  setTimeout(() => {
    tasksStore.resetDailyTasks()
    scheduleNextReset()
  }, msUntil4AM)
}

function autoBackupOnUnload() {
  if (settingsStore.autoBackup) {
    const data = {
      user: userStore.$state,
      tasks: tasksStore.tasks,
      branches: branchesStore.branches,
      rewards: rewardsStore.rewards,
      tags: tagsStore.tags,
      ui: uiStore.$state,
      settings: settingsStore.$state,
    }
    localStorage.setItem('carbon-autobackup-latest', JSON.stringify(data))
    settingsStore.recordBackup()
  }
}
</script>
