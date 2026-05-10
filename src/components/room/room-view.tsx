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
  header: ReactNode
}

export function RoomView({
  userId,
  rolls,
  chats,
  onRollRequest,
  onSendMessage,
  disabled = false,
  header,
}: Readonly<Props>) {
  // Apply the current user's saved colorset/material to the dice-box whenever
  // it (or the box) changes, so rolls render in their chosen theme.
  useDiceThemeSync()

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      {header}
      <DiceLog rolls={rolls} chats={chats} myRollerId={userId} />
      <MessageInput
        onSendMessage={onSendMessage}
        onRollRequest={onRollRequest}
        disabled={disabled}
      />
      <DiceTray onRoll={onRollRequest} disabled={disabled} />
    </div>
  )
}
