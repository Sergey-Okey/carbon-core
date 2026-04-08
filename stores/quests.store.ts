import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Quest } from '~/types/quest.types'
import { v4 as uuidv4 } from 'uuid'
import { getTodayDateString, isDateBeforeToday } from '~/utils/dateHelpers'
import { useUserStore } from './user.store'
import { useBranchesStore } from './branches.store'

export const useQuestsStore = defineStore(
  'quests',
  () => {
    const quests = ref<Quest[]>([])

    function addQuest(questData: Omit<Quest, 'id' | 'createdAt' | 'done'>) {
      const newQuest: Quest = {
        id: uuidv4(),
        ...questData,
        done: false,
        createdAt: Date.now(),
        lastResetDate:
          questData.type === 'DAILY' ? getTodayDateString() : undefined,
      }
      quests.value.push(newQuest)
    }

    function toggleQuest(id: string) {
      const quest = quests.value.find((q) => q.id === id)
      if (!quest) return
      const userStore = useUserStore()
      const branchesStore = useBranchesStore()

      if (quest.type === 'HABIT') {
        userStore.addXP(quest.xpReward)
        userStore.addGold(quest.goldReward ?? quest.xpReward * 0.1)
        branchesStore.addXPToBranch(quest.branchId, quest.xpReward)
      } else {
        if (!quest.done) {
          quest.done = true
          quest.completedAt = Date.now()
          userStore.addXP(quest.xpReward)
          userStore.addGold(quest.goldReward ?? quest.xpReward * 0.1)
          branchesStore.addXPToBranch(quest.branchId, quest.xpReward)
        }
      }
    }

    function deleteQuest(id: string) {
      const index = quests.value.findIndex((q) => q.id === id)
      if (index !== -1) quests.value.splice(index, 1)
    }

    function resetDailyQuests() {
      const today = getTodayDateString()
      quests.value.forEach((quest) => {
        if (quest.type === 'DAILY') {
          if (
            quest.lastResetDate &&
            isDateBeforeToday(quest.lastResetDate, today)
          ) {
            quest.done = false
            quest.lastResetDate = today
          } else if (!quest.lastResetDate) {
            quest.lastResetDate = today
          }
        }
      })
    }

    function getQuestsByBranch(branchId: string) {
      return quests.value.filter((q) => q.branchId === branchId)
    }

    function getActiveQuests() {
      return quests.value.filter((q) => !q.done || q.type === 'HABIT')
    }

    function initSeedData() {
      if (quests.value.length === 0) {
        const seed: Omit<Quest, 'id' | 'createdAt' | 'done'>[] = [
          {
            title: 'SMC Анализ',
            description: '06:30',
            type: 'DAILY',
            branchId: 'FIN',
            xpReward: 150,
          },
          {
            title: 'Тренировка',
            description: '19:00',
            type: 'DAILY',
            branchId: 'BODY',
            xpReward: 200,
          },
          {
            title: 'Английский',
            description: '20:30',
            type: 'DAILY',
            branchId: 'MIND',
            xpReward: 100,
          },
        ]
        seed.forEach((data) => addQuest(data))
      }
    }

    initSeedData()

    return {
      quests,
      addQuest,
      toggleQuest,
      deleteQuest,
      resetDailyQuests,
      getQuestsByBranch,
      getActiveQuests,
    }
  },
  {
    persist: { key: 'carbon-quests', storage: localStorage },
  }
)
