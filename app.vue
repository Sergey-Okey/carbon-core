<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useTasksStore } from '~/stores/tasks.store'
import { useSettingsStore } from '~/stores/settings.store'

const tasksStore = useTasksStore()
const settingsStore = useSettingsStore()

// Ждём готовности persistedState и применяем тему ДО рендера
await settingsStore.ready

onMounted(() => {
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
      user: JSON.parse(localStorage.getItem('carbon-user') || '{}'),
      tasks: JSON.parse(localStorage.getItem('carbon-tasks') || '[]'),
      branches: JSON.parse(localStorage.getItem('carbon-branches') || '[]'),
      rewards: JSON.parse(localStorage.getItem('carbon-rewards') || '[]'),
      tags: JSON.parse(localStorage.getItem('carbon-tags') || '[]'),
      ui: JSON.parse(localStorage.getItem('carbon-ui') || '{}'),
      settings: JSON.parse(localStorage.getItem('carbon-settings') || '{}'),
    }
    localStorage.setItem('carbon-autobackup-latest', JSON.stringify(data))
    settingsStore.recordBackup()
  }
}
</script>
