export interface Reward {
  id: string
  title: string
  description?: string
  price: number
  purchased: boolean
  purchasedAt?: number
  effect?: {
    hp?: number
    xp?: number
  }
}
