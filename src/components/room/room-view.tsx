'use client'

import { type ReactNode } from 'react'
import { useTray } from '@lambersond/3d-dice-react'
import { DiceLog } from './dice-log'
import { DiceTray } from './dice-tray'
import { MessageInput } from './message-input'
import { useDiceThemeSync } from '@/hooks/use-dice-theme-sync'
import type { ChatMessage } from '@/types/chat'
import type { RollEntry } from '@/types/roll'
import type { RollRequest } from '@lambersond/3d-dice-core'

type Props = {
  userId: string
  rolls: readonly RollEntry[]
  chats: readonly ChatMessage[]
  onRollRequest: (request: RollRequest) => void
  onSendMessage: (text: string) => void
  /** Hard gate (e.g. no profile yet) — blocks all room interaction. */
  disabled?: boolean
  /**
   * A roll is animating. Locks tray editing but, like the Roll button, does NOT
   * block rolling/sending — the renderer coalesces concurrent rolls, so the
   * message input's Send button stays live during a roll.
   */
  busy?: boolean
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
  busy = false,
  syncing = false,
  newSinceAt,
  header,
}: Readonly<Props>) {
  // Apply the current user's saved colorset/material to the dice-box whenever
  // it (or the box) changes, so rolls render in their chosen theme.
  useDiceThemeSync()

  // Tray state is lifted here so both the dice tray (which mutates it) and the
  // message input (whose Send button rolls it when the box is empty) share one
  // tray. useTray is plain local state, so it must live in their common parent.
  const tray = useTray()

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
        hasSelectedDice={tray.poolList.length > 0}
        onRollSelectedDice={() => onRollRequest(tray.toRequest())}
        disabled={disabled}
      />
      <DiceTray
        tray={tray}
        onRoll={onRollRequest}
        disabled={disabled || busy}
      />
    </div>
  )
}
