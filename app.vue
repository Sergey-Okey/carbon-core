<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useTasksStore } from '~/stores/tasks.store'

const tasksStore = useTasksStore()

onMounted(() => {
  tasksStore.resetDailyTasks()
  scheduleNextReset()
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
</script>
