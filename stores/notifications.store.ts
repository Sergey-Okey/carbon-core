import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { accessAwareStorage } from '~/utils/accessStorage'
import { useSettingsStore } from '~/stores/settings.store'
import type {
  InboxNotification,
  NotificationCategory,
  NotificationType,
  NotifyOptions,
  PushOptions,
  ToastNotification,
  ToastOptions,
} from '~/types/notification.types'

const INBOX_LIMIT = 50
const TOAST_LIMIT = 4
const DEDUPE_MS = 5000

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export const useNotificationsStore = defineStore(
  'notifications',
  () => {
    const toasts = ref<ToastNotification[]>([])
    const inbox = ref<InboxNotification[]>([])
    const toastTimers = new Map<string, number>()
    let lastDedupeKey = ''
    let lastDedupeAt = 0

    const unreadCount = computed(() => inbox.value.filter((item) => !item.read).length)
    const inboxCount = computed(() => inbox.value.length)

    function isEnabled() {
      return useSettingsStore().notificationsEnabled
    }

    function toastDurationMs(override?: number) {
      if (typeof override === 'number') return override
      return useSettingsStore().toastDuration * 1000
    }

    function isDuplicate(type: NotificationType, message: string) {
      const key = `${type}|${message}`
      const now = Date.now()
      if (key === lastDedupeKey && now - lastDedupeAt < DEDUPE_MS) return true
      lastDedupeKey = key
      lastDedupeAt = now
      return false
    }

    function clearToastTimer(id: string) {
      const timer = toastTimers.get(id)
      if (timer) {
        window.clearTimeout(timer)
        toastTimers.delete(id)
      }
    }

    function removeToast(id: string) {
      clearToastTimer(id)
      const index = toasts.value.findIndex((item) => item.id === id)
      if (index !== -1) toasts.value.splice(index, 1)
    }

    function enqueueToast(item: Omit<ToastNotification, 'id' | 'createdAt'> & { id?: string }) {
      const id = item.id ?? createId()
      const duration = item.duration
      const toastItem: ToastNotification = {
        id,
        type: item.type,
        message: item.message,
        duration,
        createdAt: new Date().toISOString(),
        action: item.action,
      }
      toasts.value.push(toastItem)
      if (toasts.value.length > TOAST_LIMIT) {
        const overflow = toasts.value.splice(0, toasts.value.length - TOAST_LIMIT)
        overflow.forEach((old) => clearToastTimer(old.id))
      }
      if (import.meta.client && duration > 0) {
        toastTimers.set(
          id,
          window.setTimeout(() => removeToast(id), duration)
        )
      }
      return id
    }

    function toast(options: ToastOptions) {
      if (!isEnabled()) return null
      const type = options.type ?? 'info'
      const message = options.message?.trim()
      if (!message) return null
      if (isDuplicate(type, message)) return null

      return enqueueToast({
        type,
        message,
        duration: toastDurationMs(options.duration),
        action: options.action,
      })
    }

    function push(options: PushOptions) {
      if (!isEnabled()) return null
      const type = options.type ?? 'info'
      const message = options.message?.trim()
      if (!message) return null
      if (isDuplicate(type, message)) return null

      const id = createId()
      const createdAt = new Date().toISOString()
      const category: NotificationCategory = options.category ?? 'system'

      inbox.value.unshift({
        id,
        type,
        category,
        message,
        createdAt,
        read: false,
        title: options.title,
      })
      if (inbox.value.length > INBOX_LIMIT) {
        inbox.value = inbox.value.slice(0, INBOX_LIMIT)
      }

      if (!options.silent && options.toast !== false) {
        enqueueToast({
          id: `${id}-toast`,
          type,
          message,
          duration: toastDurationMs(options.duration),
          action: options.action,
        })
      }

      return id
    }

    function notify(
      type: NotificationType,
      message: string,
      options: NotifyOptions = {}
    ) {
      const shouldPersist =
        options.persist === true ||
        (options.persist !== false && (type === 'warning' || type === 'error'))

      if (shouldPersist) {
        return push({
          type,
          message,
          category: options.category,
          title: options.title,
          duration: options.duration,
          action: options.action,
          silent: options.silent,
          toast: !options.silent,
        })
      }

      if (options.silent) return null
      return toast({
        type,
        message,
        duration: options.duration,
        action: options.action,
      })
    }

    function success(message: string, options?: NotifyOptions) {
      return notify('success', message, options)
    }
    function info(message: string, options?: NotifyOptions) {
      return notify('info', message, options)
    }
    function warning(message: string, options?: NotifyOptions) {
      return notify('warning', message, options)
    }
    function error(message: string, options?: NotifyOptions) {
      return notify('error', message, options)
    }

    function markRead(id: string) {
      const item = inbox.value.find((entry) => entry.id === id)
      if (item) item.read = true
    }

    function markAllRead() {
      inbox.value.forEach((item) => {
        item.read = true
      })
    }

    function removeInboxItem(id: string) {
      const index = inbox.value.findIndex((item) => item.id === id)
      if (index !== -1) inbox.value.splice(index, 1)
    }

    function clearInbox() {
      inbox.value = []
    }

    return {
      toasts,
      inbox,
      unreadCount,
      inboxCount,
      toast,
      push,
      notify,
      success,
      info,
      warning,
      error,
      removeToast,
      markRead,
      markAllRead,
      removeInboxItem,
      clearInbox,
    }
  },
  {
    persist: import.meta.client
      ? {
          key: 'carbon-notifications',
          storage: accessAwareStorage,
          pick: ['inbox'],
          afterHydrate: (ctx) => {
            const state = ctx.store as ReturnType<typeof useNotificationsStore>
            state.inbox = state.inbox.map((item) => ({
              ...item,
              read: typeof item.read === 'boolean' ? item.read : true,
              category: item.category || 'system',
            }))
          },
        }
      : undefined,
  }
)
