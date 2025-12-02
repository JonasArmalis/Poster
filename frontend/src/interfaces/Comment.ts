import type { User } from './User'

export interface Comment {
  id: number
  postId: number
  userId: number
  content: string
  created_at: string
  updated_at: string
  user: User | null
}
