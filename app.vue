<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user.store'
import { useQuestsStore } from '~/stores/quests.store'
import { useHealth } from '~/composables/useHealth'

const userStore = useUserStore()
const questsStore = useQuestsStore()

onMounted(() => {
  questsStore.resetDailyQuests()
  const { checkAndApplyPenalty } = useHealth()
  checkAndApplyPenalty()
  scheduleNextPenaltyCheck()
})

function scheduleNextPenaltyCheck() {
  const now = new Date()
  const next4AM = new Date(now)
  next4AM.setDate(now.getDate() + 1)
  next4AM.setHours(4, 0, 0, 0)
  const msUntil4AM = next4AM.getTime() - now.getTime()

  setTimeout(() => {
    const { applyPenaltyIfNeeded } = useHealth()
    applyPenaltyIfNeeded()
    scheduleNextPenaltyCheck()
  }, msUntil4AM)
}
</script>
