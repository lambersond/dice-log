'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ABLY_RECONNECTED_EVENT } from '@/providers/ably'
import type { ChatMessage } from '@/types/chat'
import type { RollEntry } from '@/types/roll'
import type * as Ably from 'ably'

type HistoryFn = Ably.RealtimeChannel['history']

type Options = {
  history: HistoryFn
  getLatestAt: () => number
  onRoll: (roll: RollEntry) => void
  onChat: (chat: ChatMessage) => void
}

type Result = {
  syncing: boolean
  newSinceAt: number | undefined
  clearNewSince: () => void
}

function applyMessage(
  message: Ably.InboundMessage,
  onRoll: (roll: RollEntry) => void,
  onChat: (chat: ChatMessage) => void,
): void {
  if (message.name === 'roll') {
    onRoll(message.data as RollEntry)
  } else if (message.name === 'chat') {
    onChat(message.data as ChatMessage)
  }
}

export function useRoomResync({
  history,
  getLatestAt,
  onRoll,
  onChat,
}: Options): Result {
  const [syncing, setSyncing] = useState(false)
  const [newSinceAt, setNewSinceAt] = useState<number | undefined>()

  const runningRef = useRef(false)
  const hiddenAtRef = useRef<number | undefined>(undefined)

  const historyRef = useRef(history)
  const getLatestAtRef = useRef(getLatestAt)
  const onRollRef = useRef(onRoll)
  const onChatRef = useRef(onChat)
  useEffect(() => {
    historyRef.current = history
    getLatestAtRef.current = getLatestAt
    onRollRef.current = onRoll
    onChatRef.current = onChat
  })

  const resync = useCallback(async () => {
    if (runningRef.current) return
    runningRef.current = true

    const marker = hiddenAtRef.current
    const fetchStart = getLatestAtRef.current()
    setSyncing(true)
    try {
      let appliedAny = false
      let page: Ably.PaginatedResult<Ably.InboundMessage> | null | undefined =
        await historyRef.current({
          start: fetchStart,
          direction: 'forwards',
          limit: 1000,
        })
      while (page) {
        for (const message of page.items) {
          applyMessage(message, onRollRef.current, onChatRef.current)
          appliedAny = true
        }
        page = page.hasNext() ? await page.next() : undefined
      }

      const hasNew = appliedAny || getLatestAtRef.current() > (marker ?? 0)
      if (marker !== undefined && hasNew) setNewSinceAt(marker)
    } catch (error) {
      console.error('[resync] history backfill failed', error)
    } finally {
      setSyncing(false)
      runningRef.current = false
    }
  }, [])

  const clearNewSince = useCallback(() => setNewSinceAt(undefined), [])

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAtRef.current = getLatestAtRef.current()
        setNewSinceAt(undefined)
      } else {
        void resync()
      }
    }
    const onReconnect = () => void resync()

    document.addEventListener('visibilitychange', onVisibility)
    globalThis.addEventListener(ABLY_RECONNECTED_EVENT, onReconnect)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      globalThis.removeEventListener(ABLY_RECONNECTED_EVENT, onReconnect)
    }
  }, [resync])

  return { syncing, newSinceAt, clearNewSince }
}
