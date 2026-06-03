import type { RollResult } from '@lambersond/3d-dice-core'

export type RollerInfo = {
  id: string
  name?: string
  image?: string
}

export type RollEntry = RollResult & { roller: RollerInfo }
