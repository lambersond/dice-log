'use client'

import { useCallback, useMemo } from 'react'
import {
  DicePreferencesProvider,
  localStoragePreferences,
} from '@lambersond/3d-dice-react'
import Image from 'next/image'
import Link from 'next/link'
import { RoomView } from './room-view'
import { DicePreferencesButton } from '@/components/dice-preferences'
import { usePersistedChats } from '@/hooks/use-persisted-chats'
import { usePersistedRolls } from '@/hooks/use-persisted-rolls'
import { useRollExecutor } from '@/hooks/use-roll-executor'
import { useUserProfile } from '@/hooks/use-user-profile'
import type { ChatMessage } from '@/types/chat'

export function LonelyRoom({ userId }: Readonly<{ userId: string }>) {
  // Dice preferences (colour/material) persist under the same key as rooms so a
  // player's dice look the same solo or together. Lonely needs its own provider
  // because it lives outside the connected-room tree that supplies one.
  const storage = useMemo(
    () => localStoragePreferences('dice-log:dice-preferences'),
    [],
  )
  return (
    <DicePreferencesProvider storage={storage}>
      <LonelyRoomInner userId={userId} />
    </DicePreferencesProvider>
  )
}

function LonelyRoomInner({ userId }: Readonly<{ userId: string }>) {
  const { profile } = useUserProfile()
  const { rolls, append: appendRoll } = usePersistedRolls(
    'dice-log:rolls:lonely',
  )
  const { chats, append: appendChat } = usePersistedChats(
    'dice-log:chats:lonely',
  )
  // Solo room: no one to keep in sync, so roll the dice for real and read the
  // result off the physics (non-deterministic) instead of pre-computing it.
  const { requestRoll, busy } = useRollExecutor({
    userId,
    onLocalResult: appendRoll,
    deterministic: false,
  })

  const handleSendMessage = useCallback(
    (text: string) => {
      const message: ChatMessage = {
        id: crypto.randomUUID(),
        at: Date.now(),
        sender: { id: userId, name: profile?.name, image: profile?.image },
        text,
      }
      appendChat(message)
    },
    [userId, profile?.name, profile?.image, appendChat],
  )

  return (
    <RoomView
      userId={userId}
      rolls={rolls}
      chats={chats}
      onRollRequest={requestRoll}
      onSendMessage={handleSendMessage}
      disabled={busy}
      header={<LonelyHeader />}
    />
  )
}

function LonelyHeader() {
  return (
    <header className='flex items-center justify-between gap-2 border-b border-border-light bg-appbar p-3'>
      <div className='flex flex-1 items-center'>
        <Link
          href='/'
          className='inline-flex items-center rounded-md p-1 hover:bg-hover'
        >
          <Image
            src='/logo.png'
            alt='Dice Log home'
            width={36}
            height={34}
            priority
          />
        </Link>
      </div>
      <div className='flex flex-col items-center'>
        <span className='text-[10px] uppercase tracking-widest text-text-secondary'>
          Mode
        </span>
        <span className='font-mono text-base font-semibold text-text-primary'>
          Lonely time
        </span>
      </div>
      <div className='flex flex-1 items-center justify-end'>
        <DicePreferencesButton />
      </div>
    </header>
  )
}
