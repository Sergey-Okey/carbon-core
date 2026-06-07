import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useUserStore } from '~/stores/user.store'
import { getBackendFetchOptions, getBackendUrl } from '~/utils/backend'

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
  return typeof error === 'object' && error !== null && 'statusCode' in error
    ? Number((error as { statusCode?: unknown }).statusCode)
    : 0
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

    function applyServerUser(user: Omit<User, 'password' | 'bio'> & { bio?: string }) {
      currentUser.value = { ...user, password: '', bio: user.bio || '' }
      isAuthenticated.value = true
      syncUserProfile(currentUser.value)
      persistSession()
    }

    async function init() {
      if (!import.meta.client || initialized.value) return

      usersCount.value = getUsers().length

      if (currentUser.value && isAuthenticated.value) {
        syncUserProfile(currentUser.value)
      }

      try {
        const session = (await $fetch(getBackendUrl('/api/auth/session'), {
          ...getBackendFetchOptions(),
        })) as {
          user?: {
            id: string
            email: string
            name: string
            avatar: string
            provider: 'local' | 'google' | 'yandex'
            createdAt?: string
          } | null
        }
        if (session.user) {
          currentUser.value = {
            ...session.user,
            password: '',
            bio: '',
            createdAt: currentUser.value?.createdAt || new Date().toISOString(),
          }
          isAuthenticated.value = true
          syncUserProfile(currentUser.value)
          persistSession()
        }
      } catch {
        // Local profiles remain available when the OAuth backend is offline.
      }

      initialized.value = true
    }

    async function register(
      email: string,
      password: string,
      name: string,
      mode: AuthMode = 'cloud',
      acceptedTerms = false
    ): Promise<{ success: boolean; error?: string }> {
      isLoading.value = true

      try {
        if (!acceptedTerms) {
          return { success: false, error: 'Необходимо принять условия использования' }
        }

        if (mode === 'cloud') try {
          const response = (await $fetch(getBackendUrl('/api/auth/register'), {
              method: 'POST',
              body: { email, password, name, acceptedTerms, termsVersion: '2026-06-07' },
              ...getBackendFetchOptions(),
            })) as { user: Omit<User, 'password' | 'bio'> }
          applyServerUser(response.user)
          authMode.value = 'cloud'
          return { success: true }
        } catch (error) {
          const status = getHttpStatus(error)
          if (status === 409) return { success: false, error: 'Этот email уже зарегистрирован' }
          if (status && status !== 503) return { success: false, error: 'Не удалось создать аккаунт' }
          return { success: false, error: 'Облачная регистрация недоступна. Выберите локальный режим' }
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

        return { success: true }
      } catch (error) {
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
        if (mode === 'cloud') try {
          const response = (await $fetch(getBackendUrl('/api/auth/login'), {
              method: 'POST',
              body: { email, password },
              ...getBackendFetchOptions(),
            })) as { user: Omit<User, 'password' | 'bio'> }
          applyServerUser(response.user)
          authMode.value = 'cloud'
          return { success: true }
        } catch (error) {
          const status = getHttpStatus(error)
          if (status === 401) return { success: false, error: 'Неверный email или пароль' }
          if (status && status !== 503) return { success: false, error: 'Не удалось выполнить вход' }
          return { success: false, error: 'Облачный вход недоступен. Выберите локальный режим' }
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

        return { success: true }
      } catch (error) {
        return { success: false, error: getStorageErrorMessage(error) }
      } finally {
        isLoading.value = false
      }
    }

    function logout(): void {
      void $fetch(getBackendUrl('/api/auth/logout'), {
        method: 'POST',
        ...getBackendFetchOptions(),
      }).catch(() => undefined)
      currentUser.value = null
      isAuthenticated.value = false
      syncUserProfile(null)
      persistSession()
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
          const response = (await $fetch(getBackendUrl('/api/auth/account'), {
            method: 'PATCH',
            body: updates,
            ...getBackendFetchOptions(),
          })) as { user: Omit<User, 'password' | 'bio'> }
          applyServerUser({ ...response.user, bio: updates.bio ?? previousUser.bio })
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
        return { success: true }
      } catch (error) {
        currentUser.value = previousUser
        syncUserProfile(previousUser)
        persistSession()
        return { success: false, error: getStorageErrorMessage(error) }
      }
    }

    async function deleteAccount(): Promise<{ success: boolean; error?: string }> {
      if (!currentUser.value) return { success: false }

      if (authMode.value === 'cloud') {
        try {
          await $fetch(getBackendUrl('/api/auth/account'), {
            method: 'DELETE',
            ...getBackendFetchOptions(),
          })
        } catch {
          return { success: false, error: 'Не удалось удалить облачный аккаунт' }
        }
      }

      const users = getUsers().filter((user) => user.id !== currentUser.value?.id)
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
      userInitials,
      hasRegisteredUsers,
      init,
      register,
      login,
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
