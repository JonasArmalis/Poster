import { jwtDecode } from 'jwt-decode'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useNotifyStore } from './notification.store'
import { requestLogin } from '@/services/AuthorizationService'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(window.localStorage.getItem('access_token'))
  const userId = ref<number | null>(Number(window.localStorage.getItem('user_id')) || null)
  const userRole = ref<'admin' | 'worker' | null>(
    (window.localStorage.getItem('user_role') as any) || null
  )

  const isUserLoggedIn = computed((): boolean => {
    if (!accessToken.value) return false

    try {
      const decodedToken: any = jwtDecode(accessToken.value)
      const currentTime = Date.now() / 1000
      return decodedToken.exp >= currentTime
    } catch {
      return false
    }
  })

  const user = computed(() => {
    if (!isUserLoggedIn.value || userId.value === null || userRole.value === null) {
      return null
    }
    return {
      id: userId.value,
      role: userRole.value
    }
  })

  const isAdmin = computed(() => userRole.value === 'admin')
  const isWorker = computed(() => userRole.value === 'worker')

  const login = async (email: string, password: string): Promise<boolean> => {
    const notifyStore = useNotifyStore()

    try {
      const { token, user } = await requestLogin(email, password)

      window.localStorage.setItem('access_token', token)
      window.localStorage.setItem('user_id', `${user.id}`)
      window.localStorage.setItem('user_role', user.role)

      accessToken.value = token
      userId.value = user.id
      userRole.value = user.role

      notifyStore.notifySuccess('Success! You are now logged in.')
      return true
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'Network Error') {
          notifyStore.notifyError('Unable to login, please try again later.')
        } else if (error.message === 'Invalid Credentials') {
          notifyStore.notifyError('The username or password is incorrect')
        } else {
          notifyStore.notifyError('An error occurred. Please try again later.')
        }
      }
      return false
    }
  }

  const logout = async () => {
    accessToken.value = null
    userId.value = null
    userRole.value = null

    window.localStorage.removeItem('access_token')
    window.localStorage.removeItem('user_id')
    window.localStorage.removeItem('user_role')
  }

  return {
    user,
    userId,
    userRole,
    accessToken,
    isUserLoggedIn,
    isAdmin,
    isWorker,
    login,
    logout
  }
})
