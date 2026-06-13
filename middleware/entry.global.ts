import { Capacitor } from '@capacitor/core'
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
  await authStore.init()

  const onboardingState = safeParse<{ hasSeenOnboarding: boolean } | null>(
    localStorage.getItem('carbon-onboarding'),
    null
  )
  const users = safeParse<unknown[]>(localStorage.getItem('carbon-users'), [])
  const isAuthenticated = Boolean(authStore.isAuthenticated && authStore.currentUser)
  const hasSeenOnboarding = Boolean(onboardingState?.hasSeenOnboarding)
  const hasUsers = users.length > 0
  const isDemo = accessMode === 'demo'
  const isPublicRoute = ['/auth', '/register', '/onboarding', '/privacy', '/terms', '/support'].includes(to.path)
  const isNative = Capacitor.isNativePlatform()

  if ((to.path === '/auth' || to.path === '/register') && isAuthenticated) {
    return navigateTo('/')
  }

  if (isAuthenticated) return

  if (isNative && to.path === '/onboarding') {
    return navigateTo(hasUsers ? '/auth' : '/register')
  }

  if (!isNative && !hasSeenOnboarding && !hasUsers && !isPublicRoute) {
    return navigateTo('/onboarding')
  }

  if (!isNative && to.path === '/auth' && !hasSeenOnboarding && !hasUsers) {
    return navigateTo('/onboarding')
  }

  if (!isAuthenticated && !isDemo && !isPublicRoute) {
    if (hasUsers) return navigateTo('/auth')
    return navigateTo(isNative || hasSeenOnboarding ? '/register' : '/onboarding')
  }
})
