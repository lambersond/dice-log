'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ABLY_RECONNECTED_EVENT } from '@/providers/ably'
import type { ChatMessage } from '@/types/chat'
import type { RollResult } from '@/types/roll'
import type * as Ably from 'ably'

type HistoryFn = Ably.RealtimeChannel['history']

type Options = {
  history: HistoryFn
  /**
   * Returns the `at` timestamp of the newest message we already hold (rolls and
   * chats combined), or 0 when the log is empty. Used as the lower bound for
   * the history fetch.
   */
  getLatestAt: () => number
  /** Append a backfilled roll to the log. Must NOT animate the 3D dice. */
  onRoll: (roll: RollResult) => void
  onChat: (chat: ChatMessage) => void
}

type Result = {
  /** True while a history fetch is in flight — drives the "Catching up…" UI. */
  syncing: boolean
  /**
   * The high-water mark captured when the tab was last hidden. The log renders
   * a "new since you left" divider before the first item newer than this.
   * Undefined when there's nothing new to mark.
   */
  newSinceAt: number | undefined
  /** Dismiss the "new since you left" divider (e.g. once the user re-engages). */
  clearNewSince: () => void
}

function applyMessage(
  message: Ably.InboundMessage,
  onRoll: (roll: RollResult) => void,
  onChat: (chat: ChatMessage) => void,
): void {
  if (message.name === 'roll') {
    onRoll(message.data as RollResult)
  } else if (message.name === 'chat') {
    onChat(message.data as ChatMessage)
  }
}

/**
 * Catches a room up on messages it missed while the tab was backgrounded.
 *
 * Ably's channel `rewind` only covers a fresh attach (and, without persistence,
 * a ~2-minute window), so a phone that sat in the background for an hour comes
 * back having missed everything in between. On resume we instead query the
 * History API forward from our newest known message and replay those into the
 * log. Backfilled rolls are appended only — never animated — so the user sees
 * what they missed in the log without a flurry of 3D dice.
 *
 * Resume is detected two ways: the tab becoming visible again, and the
 * `ABLY_RECONNECTED_EVENT` the provider dispatches after an offline→online
 * transition.
 *
 * NOTE: history beyond ~2 minutes requires persistence to be enabled on the
 * room channel namespace in the Ably dashboard (Channel rules → Persist last
 * messages / Persist all messages). Without it this still works, but only
 * recovers the last couple of minutes.
 */
export function useRoomResync({
  history,
  getLatestAt,
  onRoll,
  onChat,
}: Options): Result {
  const [syncing, setSyncing] = useState(false)
  const [newSinceAt, setNewSinceAt] = useState<number | undefined>()

  // Guards against overlapping resyncs (e.g. visibility + reconnect firing
  // together). A ref so it's synchronous and doesn't trigger renders.
  const runningRef = useRef(false)
  // High-water mark captured the moment the tab went hidden — the divider point.
  const hiddenAtRef = useRef<number | undefined>(undefined)

  // Keep the latest callbacks/getter in refs so the resync callback is stable
  // and our event listeners don't need re-binding on every render.
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
          // `start` is inclusive; the boundary message gets re-fetched but the
          // append paths dedupe by id, so this just guarantees no gap.
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

      // Show the divider if anything arrived past the point we left — either
      // backfilled here, or delivered live while the tab was briefly hidden.
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
        // Remember where we were so the next return can mark what's new, and
        // clear any stale divider from a previous return.
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
