import httpClient from './HttpClient'
import type { User, UserRole } from '@/interfaces/User'
import { useAuthStore } from '@/stores/authStore'
import { format } from 'date-fns'

const END_POINT = '/users'

const getAllUsers = async (): Promise<User[]> => {
  const authStore = useAuthStore()

  const response = await httpClient.get<User[]>(END_POINT, {
    headers: {
      Authorization: `Bearer ${authStore.accessToken}`
    }
  })

  return response.data
}

const createUser = async (
  name: string,
  email: string,
  password: string,
  role: UserRole
): Promise<User> => {
  const authStore = useAuthStore()

  const response = await httpClient.post<User>(
    END_POINT,
    {
      name,
      email,
      password,
      role,
      created_at: format(Date.now(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      updated_at: format(Date.now(), "yyyy-MM-dd'T'HH:mm:ss'Z'")
    },
    {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`
      }
    }
  )

  return response.data
}

const updateUserRole = async (id: number, role: UserRole): Promise<User> => {
  const authStore = useAuthStore()

  const response = await httpClient.patch<User>(
    `${END_POINT}/${id}`,
    {
      role,
      updated_at: format(Date.now(), "yyyy-MM-dd'T'HH:mm:ss'Z'")
    },
    {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`
      }
    }
  )

  return response.data
}

const deleteUser = async (id: number): Promise<void> => {
  const authStore = useAuthStore()

  await httpClient.delete<void>(`${END_POINT}/${id}`, {
    headers: {
      Authorization: `Bearer ${authStore.accessToken}`
    }
  })
}

export { getAllUsers, createUser, updateUserRole, deleteUser }
