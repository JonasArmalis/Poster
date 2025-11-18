import type { User } from './User'

export interface Post {
  id: number
  title: string
  body: string
  created_at: string
  updated_at: string
  userId: number
  user: User
}
