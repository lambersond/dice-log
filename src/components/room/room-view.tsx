'use client'

import { type ReactNode } from 'react'
import { DiceLog } from './dice-log'
import { DiceTray } from './dice-tray'
import { MessageInput } from './message-input'
import { useDiceThemeSync } from '@/hooks/use-dice-theme-sync'
import type { ChatMessage } from '@/types/chat'
import type { RollRequest, RollResult } from '@/types/roll'

type Props = {
  userId: string
  rolls: readonly RollResult[]
  chats: readonly ChatMessage[]
  onRollRequest: (request: RollRequest) => void
  onSendMessage: (text: string) => void
  disabled?: boolean
  /** True while catching up on missed history after returning to the room. */
  syncing?: boolean
  /** Render a "new since you left" divider before the first item newer than this. */
  newSinceAt?: number
  header: ReactNode
}

export function RoomView({
  userId,
  rolls,
  chats,
  onRollRequest,
  onSendMessage,
  disabled = false,
  syncing = false,
  newSinceAt,
  header,
}: Readonly<Props>) {
  // Apply the current user's saved colorset/material to the dice-box whenever
  // it (or the box) changes, so rolls render in their chosen theme.
  useDiceThemeSync()

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      {header}
      {syncing && (
        <div className='flex items-center justify-center gap-2 border-b border-border-light bg-card/60 py-1.5 text-xs text-text-secondary'>
          <span className='size-2 animate-pulse rounded-full bg-primary' />
          <span>Catching up…</span>
        </div>
      )}
      <DiceLog
        rolls={rolls}
        chats={chats}
        myRollerId={userId}
        newSinceAt={newSinceAt}
      />
      <MessageInput
        onSendMessage={onSendMessage}
        onRollRequest={onRollRequest}
        disabled={disabled}
      />
      <DiceTray onRoll={onRollRequest} disabled={disabled} />
    </div>
  )
}
