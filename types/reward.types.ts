export interface Reward {
  id: string
  title: string
  description?: string
  price: number
  purchased: boolean
  purchasedAt?: number
  completed: boolean
  completedAt?: number
  effect?: {
    xp?: number
    coins?: number
    leaguePoints?: number
  }
}
