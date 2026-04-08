import { useUserStore } from '~/stores/user.store'
import { useQuestsStore } from '~/stores/quests.store'
import { getTodayDateString, isDateBeforeToday } from '~/utils/dateHelpers'

export function useHealth() {
  const userStore = useUserStore()
  const questsStore = useQuestsStore()

  function checkAndApplyPenalty() {
    const lastPenaltyDate = localStorage.getItem('carbon-last-penalty')
    const today = getTodayDateString()
    if (lastPenaltyDate && !isDateBeforeToday(lastPenaltyDate, today)) {
      return
    }
    applyPenaltyIfNeeded()
  }

  function applyPenaltyIfNeeded() {
    const today = getTodayDateString()
    const dailyQuests = questsStore.quests.filter((q) => q.type === 'DAILY')
    const allCompleted = dailyQuests.every((q) => {
      if (!q.completedAt) return false
      const completedDate = new Date(q.completedAt).toISOString().split('T')[0]
      return completedDate === today || isDateBeforeToday(completedDate, today)
    })

    if (!allCompleted) {
      userStore.reduceHP(20)
    }
    localStorage.setItem('carbon-last-penalty', today)
  }

  return { checkAndApplyPenalty, applyPenaltyIfNeeded }
}
