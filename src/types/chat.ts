import type { RollerInfo } from './roll'

export type ChatMessage = {
  id: string
  at: number
  sender: RollerInfo
  text: string
}
