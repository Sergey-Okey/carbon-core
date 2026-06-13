import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { ACCESS_STORAGE_KEY, promoteDemoData, type AccessMode } from '~/utils/accessStorage'
import { browserLog } from '~/utils/browserLog'

export const SUBSCRIPTION_PRICE = 250
export const SUBSCRIPTION_PAYMENT_URL = 'https://pay.cloudtips.ru/p/f36fd8ac'

export const useAccessStore = defineStore(
  'access',
  () => {
    const mode = ref<AccessMode>('guest')
    const activatedAt = ref('')

    const isDemo = computed(() => mode.value === 'demo')
    const hasSubscription = computed(() => mode.value === 'subscribed')
    const canPersist = computed(() => hasSubscription.value)

    function startDemo() {
      mode.value = 'demo'
      activatedAt.value = ''
      browserLog.info('access', 'Включен демо-режим')
    }

    function activateSubscription() {
      promoteDemoData()
      mode.value = 'subscribed'
      activatedAt.value = new Date().toISOString()
      browserLog.info('access', 'Подписка активирована', { activatedAt: activatedAt.value })
    }

    function leaveDemo() {
      if (mode.value !== 'demo') return
      mode.value = 'guest'
      activatedAt.value = ''
      browserLog.info('access', 'Демо-режим завершен')
    }

    return {
      mode,
      activatedAt,
      isDemo,
      hasSubscription,
      canPersist,
      startDemo,
      activateSubscription,
      leaveDemo,
    }
  },
  {
    persist: import.meta.client
      ? { key: ACCESS_STORAGE_KEY, storage: localStorage }
      : undefined,
  }
)
