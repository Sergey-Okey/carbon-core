import { storeToRefs } from 'pinia'
import { useNotificationsStore } from '~/stores/notifications.store'
import { useFeedback } from '~/composables/useFeedback'
import type {
  NotificationAction,
  NotificationCategory,
  NotificationType,
  NotifyOptions,
} from '~/types/notification.types'

export type {
  NotificationType,
  NotificationCategory,
  NotificationAction,
} from '~/types/notification.types'


export type Notification = {
  id: string
  type: NotificationType
  category: NotificationCategory
  source?: 'platform' | 'app'
  message: string
  duration?: number
  action?: NotificationAction
  createdAt?: string
}


export function useNotification() {
  const store = useNotificationsStore()
  const { trigger } = useFeedback()
  const { toasts, inbox, unreadCount, inboxCount } = storeToRefs(store)

  function buzz(type: NotificationType, silent?: boolean) {
    if (silent) return
    if (type === 'error' || type === 'warning') {
      void trigger(type === 'error' ? 'error' : 'warning')
    }
  }

  
  function addNotification(
    notification: Omit<Notification, 'id' | 'createdAt' | 'category'> & {
      category?: NotificationCategory
      silent?: boolean
      history?: boolean
      important?: boolean
      source?: 'platform' | 'app'
      persist?: boolean
    }
  ) {
    const type = notification.type
    const message = notification.message
    const category = notification.category ?? 'system'

    const forcePersist =
      notification.persist === true ||
      notification.history === true ||
      notification.source === 'platform' ||
      notification.important === true

    const persist =
      forcePersist ||
      (notification.persist !== false && (type === 'warning' || type === 'error'))

    if (persist) {
      const id = store.push({
        type,
        message,
        category,
        duration: notification.duration,
        action: notification.action,
        silent: notification.silent,
        toast: !notification.silent,
      })
      buzz(type, notification.silent)
      return id
    }

    if (notification.silent) return null
    const id = store.toast({
      type,
      message,
      duration: notification.duration,
      action: notification.action,
    })
    buzz(type)
    return id
  }

  function withBuzz<T extends NotificationType>(
    type: T,
    fn: (message: string, opts?: NotifyOptions) => string | null
  ) {
    return (message: string, opts?: NotifyOptions) => {
      const id = fn(message, opts)
      buzz(type, opts?.silent)
      return id
    }
  }

  return {
    notifications: toasts,
    notificationHistory: inbox,
    unreadCount,
    inboxCount,
    addNotification,
    removeNotification: store.removeToast,
    removeHistoryItem: store.removeInboxItem,
    clearNotificationHistory: store.clearInbox,
    markAllRead: store.markAllRead,
    markRead: store.markRead,
    toast: store.toast,
    push: store.push,
    success: withBuzz('success', store.success),
    info: withBuzz('info', store.info),
    warning: withBuzz('warning', store.warning),
    error: withBuzz('error', store.error),
  }
}
