export * from './user.types'
export * from './quest.types'
export * from './branch.types'
export * from './reward.types'

declare module 'pinia' {
  export interface PiniaCustomProperties {
    $persistedState?: {
      isReady: Promise<void>
    }
  }
}
