import type { NotificationType } from "@/types/NotificationType"

export interface Notification {
  message: string
  type: NotificationType
  notifyTime: number
}
