'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePresenceListener } from 'ably/react'
import { Users, X } from 'lucide-react'
import { Avatar } from '@/components/avatar'
import { Button, IconButton } from '@/components/common'

type PresenceData = {
  name?: string
  image?: string
}

type Player = {
  id: string
  name?: string
  image?: string
}

type Props = {
  channelName: string
}

export function PlayersButton({ channelName }: Readonly<Props>) {
  const [open, setOpen] = useState(false)
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

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <Button
        intent='text-secondary'
        variant='ghost'
        size='sm'
        icon={Users}
        onClick={() => setOpen(true)}
        aria-label={`Players (${players.length})`}
      >
        <span className='font-mono tabular-nums'>{players.length}</span>
      </Button>

      {open && (
        <PlayersModal players={players} onClose={() => setOpen(false)} />
      )}
    </>
  )
}

function PlayersModal({
  players,
  onClose,
}: Readonly<{ players: readonly Player[]; onClose: () => void }>) {
  return (
    <dialog
      aria-modal='true'
      aria-label='Players'
      className='fixed inset-0 z-50 flex items-center justify-center px-4'
    >
      <button
        type='button'
        aria-label='Close players'
        onClick={onClose}
        className='absolute inset-0 cursor-default bg-black/60'
      />
      <div className='relative z-10 w-full max-w-sm overflow-hidden rounded-xl bg-paper shadow-2xl'>
        <header className='flex items-center justify-between border-b border-border-light p-3'>
          <h2 className='text-lg font-semibold text-text-primary'>
            Players ({players.length})
          </h2>
          <IconButton
            icon={X}
            onClick={onClose}
            aria-label='Close'
            tooltip='Close'
          />
        </header>

        {players.length === 0 ? (
          <p className='p-6 text-center text-sm text-text-secondary'>
            No one in the room yet.
          </p>
        ) : (
          <ul className='flex max-h-[60vh] flex-col divide-y divide-border-light overflow-y-auto'>
            {players.map(p => (
              <li key={p.id} className='flex items-center gap-3 p-3'>
                <Avatar
                  name={p.name}
                  image={p.image}
                  seed={p.id}
                  className='size-12'
                />
                <span className='truncate text-base text-text-primary'>
                  {p.name?.trim() || 'Anonymous'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </dialog>
  )
}
