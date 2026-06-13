import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  promoteDemoData,
  readAccessState,
  writeAccessState,
  type AccessMode,
} from '~/utils/accessStorage'
import { browserLog } from '~/utils/browserLog'

export const SUBSCRIPTION_PRICE = 250
export const SUBSCRIPTION_PAYMENT_URL = 'https://pay.cloudtips.ru/p/f36fd8ac'

export const useAccessStore = defineStore('access', () => {
  const initialState = readAccessState()
  const mode = ref<AccessMode>(initialState.mode)
  const activatedAt = ref(initialState.activatedAt)

  const isDemo = computed(() => mode.value === 'demo')
  const hasSubscription = computed(() => mode.value === 'subscribed')
  const canPersist = computed(() => hasSubscription.value)

  function persistState() {
    writeAccessState({
      mode: mode.value,
      activatedAt: activatedAt.value,
    })
  }

  function startDemo() {
    mode.value = 'demo'
    activatedAt.value = ''
    persistState()
    browserLog.info('access', 'Демо-режим включен')
  }

  function activateSubscription() {
    promoteDemoData()
    mode.value = 'subscribed'
    activatedAt.value = new Date().toISOString()
    persistState()
    browserLog.info('access', 'Подписка активирована', { activatedAt: activatedAt.value })
  }

  function leaveDemo() {
    if (mode.value !== 'demo') return
    mode.value = 'guest'
    activatedAt.value = ''
    persistState()
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
})
