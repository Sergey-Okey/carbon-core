import { defineStore } from 'pinia'

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
    persist: { key: 'carbon-onboarding', storage: localStorage },
  }
)
