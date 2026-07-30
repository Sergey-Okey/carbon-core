export interface Reward {
  id: string
  title: string
  description?: string
  purchased: boolean
  purchasedAt?: number
  completed: boolean
  completedAt?: number
  effect?: {
    leaguePoints?: number
  }
}
