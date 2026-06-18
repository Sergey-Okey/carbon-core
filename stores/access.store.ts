import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  DEMO_TTL_MS,
  promoteDemoData,
  readAccessState,
  writeAccessState,
  type AccessMode,
} from '~/utils/accessStorage'
import { browserLog } from '~/utils/browserLog'

export const SUBSCRIPTION_PRICE = 250
export const SUBSCRIPTION_PAYMENT_URL = 'https://auth.robokassa.ru/RecurringSubscriptionPage/Subscription/Subscribe?SubscriptionId=f1624c7a-3c92-4c9f-a3a7-0b705f3d37a8'

export const useAccessStore = defineStore('access', () => {
  const initialState = readAccessState()
  const mode = ref<AccessMode>(initialState.mode)
  const activatedAt = ref(initialState.activatedAt)
  const expiresAt = ref(initialState.expiresAt || '')

  const isDemo = computed(() => mode.value === 'demo')
  const hasSubscription = computed(() => mode.value === 'subscribed')
  const canPersist = computed(() => hasSubscription.value)

  function persistState() {
    writeAccessState({
      mode: mode.value,
      activatedAt: activatedAt.value,
      expiresAt: expiresAt.value,
    })
  }

  function startDemo() {
    const now = new Date()
    mode.value = 'demo'
    activatedAt.value = now.toISOString()
    expiresAt.value = new Date(now.getTime() + DEMO_TTL_MS).toISOString()
    persistState()
    browserLog.info('access', 'Демо-режим включен')
  }

  function activateSubscription() {
    promoteDemoData()
    mode.value = 'subscribed'
    activatedAt.value = new Date().toISOString()
    expiresAt.value = ''
    persistState()
    browserLog.info('access', 'Подписка активирована', { activatedAt: activatedAt.value })
  }

  function leaveDemo() {
    if (mode.value !== 'demo') return
    mode.value = 'guest'
    activatedAt.value = ''
    expiresAt.value = ''
    persistState()
    browserLog.info('access', 'Демо-режим завершен')
  }

  return {
    mode,
    activatedAt,
    expiresAt,
    isDemo,
    hasSubscription,
    canPersist,
    startDemo,
    activateSubscription,
    leaveDemo,
  }
})
