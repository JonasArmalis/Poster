export type UserRole = 'admin' | 'worker'

export interface User {
  id: number
  email: string
  name: string
  role: UserRole
}