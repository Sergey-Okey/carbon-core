import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  DEMO_TTL_MS,
  discardDemoWorkspace,
  readAccessMode,
  readAccessState,
  writeAccessState,
  type AccessMode,
} from '~/utils/accessStorage'
import { browserLog } from '~/utils/browserLog'
import { emptyWorkspaceStores, persistWorkspaceStores } from '~/utils/emptyWorkspace'

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

  /**
   * Clear in-memory + persisted workspace BEFORE flipping access mode.
   * Otherwise pinia-persist rewrites demo tasks into localStorage as soon as
   * accessAwareStorage starts pointing at the real account storage.
   */
  function wipeLocalWorkspace(options: { markFresh?: boolean; includePrefs?: boolean } = {}) {
    if (!import.meta.client) return

    try {
      emptyWorkspaceStores({ includePrefs: options.includePrefs })
      persistWorkspaceStores()
    } catch (error) {
      browserLog.warn('access', 'Не удалось очистить workspace в памяти', {
        message: error instanceof Error ? error.message : String(error),
      })
    }

    discardDemoWorkspace()

    try {
      persistWorkspaceStores()
    } catch (error) {
      browserLog.warn('access', 'Не удалось записать пустой workspace', {
        message: error instanceof Error ? error.message : String(error),
      })
    }

    if (options.markFresh !== false) {
      sessionStorage.setItem('cof-exit-demo', '1')
      sessionStorage.setItem('cof-workspace-fresh', '1')
    }
  }

  function activateSubscription(subscription: { activatedAt?: string; expiresAt?: string } = {}) {
    const leavingDemo = mode.value === 'demo' || readAccessMode() === 'demo'
    if (leavingDemo) {
      wipeLocalWorkspace()
    }
    mode.value = 'subscribed'
    activatedAt.value = subscription.activatedAt || activatedAt.value || new Date().toISOString()
    expiresAt.value = subscription.expiresAt || ''
    persistState()
    persistWorkspaceStores()
    browserLog.info('access', 'Подписка активирована', { activatedAt: activatedAt.value, expiresAt: expiresAt.value })
  }

  function syncSubscription(subscription: { active?: boolean; expiresAt?: string } | null | undefined) {
    if (subscription?.active) {
      activateSubscription({ expiresAt: subscription.expiresAt || '' })
      return
    }

    if (mode.value === 'subscribed') {
      mode.value = 'guest'
      activatedAt.value = ''
      expiresAt.value = ''
      persistState()
    }
  }

  function leaveDemo() {
    if (mode.value !== 'demo') return
    wipeLocalWorkspace()
    mode.value = 'guest'
    activatedAt.value = ''
    expiresAt.value = ''
    persistState()
    persistWorkspaceStores()
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
    syncSubscription,
    leaveDemo,
    wipeLocalWorkspace,
  }
})
