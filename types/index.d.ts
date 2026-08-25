export * from './user.types'
export * from './branch.types'
export * from './reward.types'
export * from './ai.types'

declare module 'pinia' {
  export interface PiniaCustomProperties {
    $persist?: () => void
    $persistedState?: {
      isReady: Promise<void>
    }
  }
}
