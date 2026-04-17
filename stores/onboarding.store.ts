import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useOnboardingStore = defineStore(
  'onboarding',
  () => {
    const hasSeenOnboarding = ref(false)

    function markAsSeen() {
      hasSeenOnboarding.value = true
    }

    return {
      hasSeenOnboarding,
      markAsSeen,
    }
  },
  {
    persist: import.meta.client
      ? { key: 'carbon-onboarding', storage: localStorage }
      : undefined,
  }
)
