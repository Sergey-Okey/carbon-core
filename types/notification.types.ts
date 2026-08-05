export type NotificationType = 'info' | 'success' | 'warning' | 'error'
export type NotificationCategory = 'system' | 'user'

export interface NotificationAction {
  label: string
  handler: () => void
}


export interface ToastNotification {
  id: string
  type: NotificationType
  message: string
  duration: number
  createdAt: string
  action?: NotificationAction
}


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
  
  toast?: boolean
  duration?: number
  action?: NotificationAction
  silent?: boolean
}

export type NotifyOptions = {
  
  persist?: boolean
  
  silent?: boolean
  category?: NotificationCategory
  title?: string
  duration?: number
  action?: NotificationAction
}
