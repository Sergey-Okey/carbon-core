import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useUserStore } from '~/stores/user.store'
import { useAccessStore } from '~/stores/access.store'
import { getBackendFetchOptions, getBackendUrl } from '~/utils/backend'
import { browserLog } from '~/utils/browserLog'

export interface User {
  id: string
  email: string
  password: string
  name: string
  bio: string
  avatar: string
  createdAt: string
  consentAt?: string
  termsVersion?: string
  provider?: 'local' | 'google' | 'yandex'
}
export type AuthMode = 'cloud' | 'local'
export type SubscriptionSnapshot = { active: boolean; expiresAt: string }
type ServerUser = Omit<User, 'password'> & { bio?: string }
type SessionResponse = {
  user?: ServerUser | null
  subscription?: SubscriptionSnapshot
}
type BackendFetch = <T = unknown>(
  url: string,
  options?: Record<string, unknown>
) => Promise<T>

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function hashPassword(password: string): string {
  let hash = 0

  for (let index = 0; index < password.length; index++) {
    const char = password.charCodeAt(index)
    hash = (hash << 5) - hash + char
    hash &= hash
  }

  return hash.toString(36)
}

function getStorageErrorMessage(error: unknown): string {
  if (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' || error.code === 22)
  ) {
    return 'Недостаточно места в localStorage. Уменьшите размер аватара или очистите старые данные.'
  }

  return 'Ошибка локального сохранения'
}

function getHttpStatus(error: unknown) {
  if (typeof error !== 'object' || error === null) return 0
  const candidate = error as {
    statusCode?: unknown
    status?: unknown
    response?: { status?: unknown }
  }
  return Number(
    candidate.statusCode || candidate.status || candidate.response?.status || 0
  )
}

export const useAuthStore = defineStore(
  'auth',
  () => {
    const currentUser = ref<User | null>(null)
    const isAuthenticated = ref(false)
    const isLoading = ref(false)
    const initialized = ref(false)
    const usersCount = ref(0)
    const authMode = ref<AuthMode>('cloud')
    const subscription = ref<SubscriptionSnapshot>({
      active: false,
      expiresAt: '',
    })
    const fetchBackend = $fetch as unknown as BackendFetch

    const userInitials = computed(() => {
      if (!currentUser.value) return ''

      return currentUser.value.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    })

    const hasRegisteredUsers = computed(() => usersCount.value > 0)

    function getUsers(): User[] {
      if (!import.meta.client) return []
      const users = localStorage.getItem('carbon-users')
      return users ? JSON.parse(users) : []
    }

    function saveUsers(users: User[]): void {
      if (!import.meta.client) return
      localStorage.setItem('carbon-users', JSON.stringify(users))
      usersCount.value = users.length
    }

    function persistSession() {
      if (!import.meta.client) return

      localStorage.setItem(
        'carbon-auth',
        JSON.stringify({
          currentUser: currentUser.value,
          isAuthenticated: isAuthenticated.value,
        })
      )
    }

    function syncUserProfile(user: User | null) {
      const userStore = useUserStore()

      if (!user) {
        userStore.resetProfile()
        return
      }

      userStore.setProfileFromAuth({
        name: user.name,
        bio: user.bio,
        email: user.email,
        avatar: user.avatar,
      })
    }

    function applyServerUser(
      user: ServerUser,
      serverSubscription?: SubscriptionSnapshot
    ) {
      const accessStore = useAccessStore()
      const nextSubscription = serverSubscription || {
        active: true,
        expiresAt: '',
      }
      subscription.value = nextSubscription
      accessStore.syncSubscription(nextSubscription)
      currentUser.value = { ...user, password: '', bio: user.bio || '' }
      isAuthenticated.value = true
      syncUserProfile(currentUser.value)
      persistSession()
    }

    function clearCloudSession() {
      const accessStore = useAccessStore()
      subscription.value = { active: false, expiresAt: '' }
      accessStore.syncSubscription(subscription.value)
      currentUser.value = null
      isAuthenticated.value = false
      syncUserProfile(null)
      persistSession()
    }

    async function init(options: { force?: boolean } = {}) {
      if (!import.meta.client || (initialized.value && !options.force)) return

      usersCount.value = getUsers().length
      browserLog.info('auth', 'Инициализация авторизации', {
        localUsers: usersCount.value,
      })

      if (currentUser.value && isAuthenticated.value) {
        syncUserProfile(currentUser.value)
      }

      try {
        const session = await fetchBackend<SessionResponse>(
          getBackendUrl('/api/auth/session'),
          getBackendFetchOptions()
        )
        if (session.user) {
          applyServerUser(session.user, session.subscription)
          browserLog.info('auth', 'Восстановлена облачная сессия', {
            provider: session.user.provider,
          })
        } else if (options.force) {
          clearCloudSession()
        }
      } catch {
        // Local profiles remain available when the OAuth backend is offline.
        browserLog.warn(
          'auth',
          'Облачная сессия недоступна, используется локальный режим'
        )
      }

      initialized.value = true
    }

    async function refreshSession(): Promise<{
      success: boolean
      error?: string
    }> {
      try {
        const session = await fetchBackend<SessionResponse>(
          getBackendUrl('/api/auth/session'),
          getBackendFetchOptions()
        )
        if (!session.user) {
          if (authMode.value === 'cloud' || currentUser.value?.provider)
            clearCloudSession()
          return { success: false, error: 'Сессия не найдена' }
        }

        applyServerUser(session.user, session.subscription)
        authMode.value = 'cloud'
        return { success: true }
      } catch (error) {
        browserLog.warn('auth', 'Не удалось синхронизировать профиль', {
          message: error instanceof Error ? error.message : String(error),
        })
        return { success: false, error: 'Не удалось синхронизировать профиль' }
      }
    }
    async function register(
      email: string,
      password: string,
      name: string,
      mode: AuthMode = 'cloud',
      acceptedTerms = false,
      phone = ''
    ): Promise<{
      success: boolean
      error?: string
      requiresVerification?: boolean
      email?: string
    }> {
      isLoading.value = true

      try {
        if (!acceptedTerms) {
          return {
            success: false,
            error: 'Необходимо принять условия использования',
          }
        }

        if (mode === 'cloud')
          try {
            const response = await fetchBackend<{
              user?: ServerUser
              subscription?: SubscriptionSnapshot
              requiresVerification?: boolean
              email?: string
            }>(getBackendUrl('/api/auth/register'), {
              method: 'POST',
              body: {
                email,
                password,
                name,
                phone,
                acceptedTerms,
                termsVersion: '2026-06-07',
              },
              ...getBackendFetchOptions(),
            })
            if (response.requiresVerification) {
              return {
                success: true,
                requiresVerification: true,
                email: response.email || email.trim().toLowerCase(),
              }
            }
            if (!response.user)
              return { success: false, error: 'Не удалось создать аккаунт' }
            applyServerUser(response.user, response.subscription)
            authMode.value = 'cloud'
            browserLog.info('auth', 'Регистрация выполнена', {
              mode: 'cloud',
              provider: 'local',
            })
            return { success: true }
          } catch (error) {
            const status = getHttpStatus(error)
            if (status === 409)
              return { success: false, error: 'Этот email уже зарегистрирован' }
            if (status === 402)
              return {
                success: false,
                error: 'Подписка для этого email не найдена или истекла',
              }
            if (status === 400)
              return {
                success: false,
                error: 'Проверьте имя, телефон, email, пароль и согласие с условиями',
              }
            if (status && status !== 503)
              return { success: false, error: 'Не удалось создать аккаунт' }
            return {
              success: false,
              error:
                'Облачная регистрация недоступна. Выберите локальный режим',
            }
          }

        await new Promise((resolve) => setTimeout(resolve, 350))
        const users = getUsers()

        if (
          users.find(
            (user) => user.email.toLowerCase() === email.trim().toLowerCase()
          )
        ) {
          return {
            success: false,
            error: 'Этот email уже зарегистрирован',
          }
        }

        const newUser: User = {
          id: generateId(),
          email: email.trim(),
          password: hashPassword(password),
          name: name.trim() || email.split('@')[0],
          bio: '',
          avatar: '',
          createdAt: new Date().toISOString(),
          consentAt: new Date().toISOString(),
          termsVersion: '2026-06-07',
        }

        users.push(newUser)
        saveUsers(users)

        currentUser.value = newUser
        isAuthenticated.value = true
        authMode.value = 'local'
        syncUserProfile(newUser)
        persistSession()
        browserLog.info('auth', 'Регистрация выполнена', { mode: 'local' })

        return { success: true }
      } catch (error) {
        browserLog.error('auth', 'Ошибка локальной регистрации', {
          message: error instanceof Error ? error.message : String(error),
        })
        return { success: false, error: getStorageErrorMessage(error) }
      } finally {
        isLoading.value = false
      }
    }

    async function login(
      email: string,
      password: string,
      mode: AuthMode = 'cloud'
    ): Promise<{ success: boolean; error?: string }> {
      isLoading.value = true

      try {
        if (mode === 'cloud')
          try {
            const response = await fetchBackend<{
              user: ServerUser
              subscription?: SubscriptionSnapshot
            }>(getBackendUrl('/api/auth/login'), {
              method: 'POST',
              body: { email, password },
              ...getBackendFetchOptions(),
            })
            applyServerUser(response.user, response.subscription)
            authMode.value = 'cloud'
            browserLog.info('auth', 'Вход выполнен', {
              mode: 'cloud',
              provider: response.user.provider,
            })
            return { success: true }
          } catch (error) {
            const status = getHttpStatus(error)
            if (status === 401)
              return { success: false, error: 'Неверный email или пароль' }
            if (status === 403)
              return {
                success: false,
                error: 'Подтвердите email кодом из письма',
              }
            if (status === 402)
              return {
                success: false,
                error: 'Подписка для этого email не найдена или истекла',
              }
            if (status && status !== 503)
              return { success: false, error: 'Не удалось выполнить вход' }
            return {
              success: false,
              error: 'Облачный вход недоступен. Выберите локальный режим',
            }
          }

        await new Promise((resolve) => setTimeout(resolve, 300))
        const users = getUsers()
        const hashedPassword = hashPassword(password)

        const user = users.find(
          (entry) =>
            entry.email.toLowerCase() === email.trim().toLowerCase() &&
            entry.password === hashedPassword
        )

        if (!user) {
          return {
            success: false,
            error: 'Неверный email или пароль',
          }
        }

        currentUser.value = user
        isAuthenticated.value = true
        authMode.value = 'local'
        syncUserProfile(user)
        persistSession()
        browserLog.info('auth', 'Вход выполнен', { mode: 'local' })

        return { success: true }
      } catch (error) {
        browserLog.error('auth', 'Ошибка локального входа', {
          message: error instanceof Error ? error.message : String(error),
        })
        return { success: false, error: getStorageErrorMessage(error) }
      } finally {
        isLoading.value = false
      }
    }

    async function verifyEmail(
      email: string,
      code: string
    ): Promise<{ success: boolean; error?: string }> {
      isLoading.value = true

      try {
        const response = await fetchBackend<{
          user: ServerUser
          subscription?: SubscriptionSnapshot
        }>(getBackendUrl('/api/auth/email-verification/verify'), {
          method: 'POST',
          body: { email, code },
          ...getBackendFetchOptions(),
        })
        applyServerUser(response.user, response.subscription)
        authMode.value = 'cloud'
        browserLog.info('auth', 'Email подтверждён', {
          mode: 'cloud',
          provider: response.user.provider,
        })
        return { success: true }
      } catch (error) {
        const status = getHttpStatus(error)
        if (status === 400)
          return { success: false, error: 'Неверный или устаревший код' }
        if (status === 429)
          return {
            success: false,
            error: 'Слишком много попыток. Запросите новый код',
          }
        if (status === 402)
          return { success: false, error: 'Для входа нужна активная подписка' }
        return { success: false, error: 'Не удалось подтвердить email' }
      } finally {
        isLoading.value = false
      }
    }

    function logout(): void {
      void fetchBackend(getBackendUrl('/api/auth/logout'), {
        method: 'POST',
        ...getBackendFetchOptions(),
      }).catch(() => undefined)
      currentUser.value = null
      isAuthenticated.value = false
      syncUserProfile(null)
      persistSession()
      browserLog.info('auth', 'Пользователь вышел из аккаунта')
    }

    async function updateProfile(
      updates: Partial<Pick<User, 'name' | 'bio' | 'email' | 'avatar'>>
    ): Promise<{ success: boolean; error?: string }> {
      if (!currentUser.value) {
        return { success: false, error: 'Пользователь не авторизован' }
      }

      const nextEmail = updates.email?.trim()
      const users = getUsers()

      if (
        nextEmail &&
        users.some(
          (user) =>
            user.id !== currentUser.value?.id &&
            user.email.toLowerCase() === nextEmail.toLowerCase()
        )
      ) {
        return { success: false, error: 'Этот email уже используется' }
      }

      const previousUser = { ...currentUser.value }
      const nextUser: User = {
        ...currentUser.value,
        ...updates,
        email: nextEmail || currentUser.value.email,
      }

      try {
        if (authMode.value === 'cloud') {
          const response = await fetchBackend<{
            user: ServerUser
            subscription?: SubscriptionSnapshot
          }>(getBackendUrl('/api/auth/account'), {
            method: 'PATCH',
            body: updates,
            ...getBackendFetchOptions(),
          })
          applyServerUser(
            {
              ...response.user,
              bio: response.user.bio ?? updates.bio ?? previousUser.bio,
            },
            response.subscription
          )
          browserLog.info('auth', 'Профиль обновлен', { mode: 'cloud' })
          return { success: true }
        }

        currentUser.value = nextUser

        const index = users.findIndex((user) => user.id === nextUser.id)
        if (index !== -1) {
          users[index] = nextUser
          saveUsers(users)
        }

        syncUserProfile(nextUser)
        persistSession()
        browserLog.info('auth', 'Профиль обновлен', { mode: 'local' })
        return { success: true }
      } catch (error) {
        currentUser.value = previousUser
        syncUserProfile(previousUser)
        persistSession()
        browserLog.error('auth', 'Ошибка обновления профиля', {
          message: error instanceof Error ? error.message : String(error),
        })
        return { success: false, error: getStorageErrorMessage(error) }
      }
    }

    async function deleteAccount(): Promise<{
      success: boolean
      error?: string
    }> {
      if (!currentUser.value) return { success: false }

      if (authMode.value === 'cloud') {
        try {
          await fetchBackend(getBackendUrl('/api/auth/account'), {
            method: 'DELETE',
            ...getBackendFetchOptions(),
          })
        } catch {
          return {
            success: false,
            error: 'Не удалось удалить облачный аккаунт',
          }
        }
      }

      const users = getUsers().filter(
        (user) => user.id !== currentUser.value?.id
      )
      saveUsers(users)
      logout()
      return { success: true }
    }

    function checkAuth(): boolean {
      if (!import.meta.client) return false
      return isAuthenticated.value
    }

    return {
      currentUser,
      isAuthenticated,
      isLoading,
      initialized,
      authMode,
      subscription,
      userInitials,
      hasRegisteredUsers,
      init,
      refreshSession,
      register,
      login,
      verifyEmail,
      logout,
      updateProfile,
      deleteAccount,
      checkAuth,
    }
  },
  {
    persist: import.meta.client
      ? {
          key: 'carbon-auth',
          storage: localStorage,
        }
      : undefined,
  }
)
