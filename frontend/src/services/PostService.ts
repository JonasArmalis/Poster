import httpClient from './HttpClient'
import type { Post } from '../interfaces/Post'
import { format } from 'date-fns'
import { useAuthStore } from '@/stores/authStore'

const END_POINT = '/posts'

const getAllPosts = async (
  page: number,
  limit: number,
  searchValue: String
): Promise<{ data: Post[]; totalAmount: number }> => {
  const response = await httpClient.get<Post[]>(END_POINT, {
    params: {
      _expand: 'user',
      _page: page,
      _limit: limit,
      q: searchValue
    }
  })

  return {
    data: response.data,
    totalAmount: response.headers['x-total-count']
  }
}

const getPostsByUser = async (
  userId: number,
  page: number,
  limit: number
): Promise<{ data: Post[]; totalAmount: number }> => {
  const response = await httpClient.get<Post[]>(END_POINT, {
    params: {
      _expand: 'user',
      _page: page,
      _limit: limit,
      userId
    }
  })

  return {
    data: response.data,
    totalAmount: response.headers['x-total-count']
  }
}

const getPost = async (id: Number): Promise<Post> => {
  const response = await httpClient.get<Post>(`${END_POINT}/${id}`, {
    params: {
      _expand: 'user'
    }
  })
  return response.data
}

const createPost = async (title: string, content: string): Promise<Post> => {
  const authStore = useAuthStore()

  if (authStore.userId === null) {
    throw new Error('Not logged in')
  }

  const response = await httpClient.post<Post>(
    END_POINT,
    {
      title: title,
      body: content,
      userId: authStore.userId,
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

const editPost = async (title: string, content: string, id: number): Promise<Post> => {
  const authStore = useAuthStore()

  const response = await httpClient.patch<Post>(
    `${END_POINT}/${id}`,
    {
      title: title,
      body: content,
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

const deletePost = async (id: number): Promise<void> => {
  const authStore = useAuthStore()

  await httpClient.delete(`${END_POINT}/${id}`, {
    headers: {
      Authorization: `Bearer ${authStore.accessToken}`
    }
  })
}

export { deletePost, editPost, getAllPosts, getPostsByUser, getPost, createPost }
