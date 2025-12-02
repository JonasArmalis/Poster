import httpClient from './HttpClient'
import type { Comment } from '@/interfaces/Comment'
import { useAuthStore } from '@/stores/authStore'

const END_POINT = '/comments'

const getCommentsForPost = async (postId: number): Promise<Comment[]> => {
  const response = await httpClient.get<Comment[]>(END_POINT, {
    params: {
      postId
    }
  })

  return response.data
}

const createComment = async (postId: number, content: string): Promise<Comment> => {
  const authStore = useAuthStore()

  if (authStore.userId === null) {
    throw new Error('Not logged in')
  }

  const response = await httpClient.post<Comment>(
    END_POINT,
    {
      postId,
      content
    },
    {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`
      }
    }
  )

  return response.data
}

const deleteComment = async (id: number): Promise<void> => {
  const authStore = useAuthStore()

  await httpClient.delete<void>(`${END_POINT}/${id}`, {
    headers: {
      Authorization: `Bearer ${authStore.accessToken}`
    }
  })
}

export { getCommentsForPost, createComment, deleteComment }
