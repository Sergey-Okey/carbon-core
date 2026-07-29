export type NotificationType = 'info' | 'success' | 'warning' | 'error'
export type NotificationCategory = 'system' | 'user'

export interface NotificationAction {
  label: string
  handler: () => void
}

/** Ephemeral toast (not persisted) */
export interface ToastNotification {
  id: string
  type: NotificationType
  message: string
  duration: number
  createdAt: string
  action?: NotificationAction
}

/** Persistent inbox item (header bell) */
export interface InboxNotification {
  id: string
  type: NotificationType
  category: NotificationCategory
  message: string
  createdAt: string
  read: boolean
  title?: string
}

export type ToastOptions = {
  type?: NotificationType
  message: string
  duration?: number
  action?: NotificationAction
}

export type PushOptions = {
  type?: NotificationType
  message: string
  category?: NotificationCategory
  title?: string
  /** Also show toast (default true) */
  toast?: boolean
  duration?: number
  action?: NotificationAction
  silent?: boolean
}

export type NotifyOptions = {
  /** Force persist to inbox */
  persist?: boolean
  /** Skip toast */
  silent?: boolean
  category?: NotificationCategory
  title?: string
  duration?: number
  action?: NotificationAction
}
