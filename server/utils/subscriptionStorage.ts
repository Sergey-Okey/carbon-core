

export function normalizeSubscriptionEmail(email: string) {
  return email.trim().toLowerCase()
}

export async function getActiveSubscription(_email: string) {
  return { active: true, expiresAt: '' as string }
}

export async function hasActiveSubscription(_email: string) {
  return true
}
