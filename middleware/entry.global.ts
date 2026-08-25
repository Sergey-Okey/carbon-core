import { readAccessMode } from '~/utils/accessStorage'

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback

  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export default defineNuxtRouteMiddleware(async (to) => {
  if (!import.meta.client) return

  const authStore = useAuthStore()
  const accessMode = readAccessMode()
  const shouldRefreshAfterOAuth = to.query.oauth === 'success'
  await authStore.init({ force: shouldRefreshAfterOAuth })

  const onboardingState = safeParse<{ hasSeenOnboarding: boolean } | null>(
    localStorage.getItem('carbon-onboarding'),
    null
  )
  const users = safeParse<unknown[]>(localStorage.getItem('carbon-users'), [])
  const isAuthenticated = Boolean(
    authStore.isAuthenticated && authStore.currentUser
  )
  const hasSeenOnboarding = Boolean(onboardingState?.hasSeenOnboarding)
  const hasUsers = users.length > 0
  const isDemo = accessMode === 'demo'
  const isPublicRoute = [
    '/auth',
    '/register',
    '/onboarding',
    '/privacy',
    '/terms',
    '/support',
  ].includes(to.path)

  if ((to.path === '/auth' || to.path === '/register') && isAuthenticated) {
    return navigateTo('/')
  }

  if (isAuthenticated) return

  if (!hasSeenOnboarding && !hasUsers && !isPublicRoute) {
    return navigateTo('/onboarding')
  }

  if (to.path === '/auth' && !hasSeenOnboarding && !hasUsers) {
    return navigateTo('/onboarding')
  }

  if (!isAuthenticated && !isDemo && !isPublicRoute) {
    if (hasUsers) return navigateTo('/auth')
    return navigateTo(hasSeenOnboarding ? '/register' : '/onboarding')
  }
})
