function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback

  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export default defineNuxtRouteMiddleware((to) => {
  if (!import.meta.client) return

  const authState = safeParse<{
    currentUser: unknown
    isAuthenticated: boolean
  } | null>(localStorage.getItem('carbon-auth'), null)
  const onboardingState = safeParse<{ hasSeenOnboarding: boolean } | null>(
    localStorage.getItem('carbon-onboarding'),
    null
  )
  const users = safeParse<unknown[]>(localStorage.getItem('carbon-users'), [])

  const isAuthenticated = Boolean(
    authState?.isAuthenticated && authState.currentUser
  )
  const hasSeenOnboarding = Boolean(onboardingState?.hasSeenOnboarding)
  const hasUsers = users.length > 0
  const isPublicRoute = ['/auth', '/register', '/onboarding'].includes(to.path)

  if (!hasSeenOnboarding && !hasUsers && to.path !== '/onboarding') {
    return navigateTo('/onboarding')
  }

  if (to.path === '/auth' && !hasSeenOnboarding && !hasUsers) {
    return navigateTo('/onboarding')
  }

  if ((to.path === '/auth' || to.path === '/register') && isAuthenticated) {
    return navigateTo('/')
  }

  if (!isAuthenticated && !isPublicRoute) {
    return navigateTo(hasSeenOnboarding || hasUsers ? '/auth' : '/onboarding')
  }
})
