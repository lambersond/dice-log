import type { ModalProps } from '../types'

export type Player = {
  id: string
  name?: string
  image?: string
}

export interface PlayersModalProps extends ModalProps {
  players: readonly Player[]
}
