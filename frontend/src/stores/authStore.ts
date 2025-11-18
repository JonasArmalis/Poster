import { jwtDecode } from 'jwt-decode'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useNotifyStore } from './notification.store'
import { requestLogin } from '@/services/AuthorizationService'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(window.localStorage.getItem('access_token'))
  const userId = ref<number | null>()

  const isUserLoggedIn = computed((): boolean => {
    if (!accessToken.value) {
      return false
    }

    try {
      const decodedToken: any = jwtDecode(accessToken.value)
      const currentTime = Date.now() / 1000

      if (decodedToken.exp < currentTime) {
        return false
      } 
      return true
    } catch (error) {
      return false
    }
  })

  const login = async (email: string, password: string): Promise<boolean> => {
    const notifyStore = useNotifyStore()

    try {
      const { token, user } = await requestLogin(email, password)
      window.localStorage.setItem('access_token', token)
      window.localStorage.setItem('user_id', `${user.id}`)
      accessToken.value = token
      userId.value = user.id
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
    window.localStorage.removeItem('access_token')
    userId.value = undefined
  }

  return {
    userId,
    accessToken,
    isUserLoggedIn,
    login,
    logout
  }
})
