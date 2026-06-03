'use client'

import { useMemo } from 'react'
import { usePresenceListener } from 'ably/react'
import { Users } from 'lucide-react'
import { Button } from '@/components/common'
import { useModals } from '@/components/modals/use-modals'
import type { Player } from '@/components/modals/players-modal/types'

type PresenceData = {
  name?: string
  image?: string
}

type Props = {
  channelName: string
}

export function PlayersButton({ channelName }: Readonly<Props>) {
  const { openModal } = useModals()
  const { presenceData } = usePresenceListener<PresenceData>(channelName)

  const players: readonly Player[] = useMemo(() => {
    const byId = new Map<string, Player>()
    for (const entry of presenceData) {
      const id = entry.clientId
      if (!id) continue
      byId.set(id, { id, name: entry.data?.name, image: entry.data?.image })
    }
    return [...byId.values()]
  }, [presenceData])

  return (
    <Button
      intent='text-secondary'
      variant='ghost'
      size='sm'
      icon={Users}
      onClick={() => openModal('players', { players })}
      aria-label={`Players (${players.length})`}
    >
      <span className='font-mono tabular-nums'>{players.length}</span>
    </Button>
  )
}
