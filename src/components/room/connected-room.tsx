'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChannelProvider, useChannel, usePresence } from 'ably/react'
import confetti from 'canvas-confetti'
import { Copy } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { PlayersButton } from './connected-players'
import { RoomView } from './room-view'
import { Button } from '@/components/common'
import { DicePreferencesButton } from '@/components/dice-preferences'
import { ProfilePromptModal } from '@/components/profile'
import { usePersistedChats } from '@/hooks/use-persisted-chats'
import { usePersistedRolls } from '@/hooks/use-persisted-rolls'
import { useRollExecutor } from '@/hooks/use-roll-executor'
import { useUserProfile } from '@/hooks/use-user-profile'
import { useVisitedRooms } from '@/hooks/use-visited-rooms'
import { copyTextToClipboard } from '@/utils/copy-text-to-clipboard'
import type { ChatMessage } from '@/types/chat'
import type { RollResult, RollerInfo } from '@/types/roll'
import type * as Ably from 'ably'

/** Skip confetti for replayed rolls coming in via channel rewind. */
const FRESH_ROLL_WINDOW_MS = 30_000

function isSoloNat20(result: RollResult): boolean {
  if (result.pools.length !== 1) return false
  const pool = result.pools[0]
  if (pool.sides !== 20 || pool.count !== 1) return false
  return pool.kept[0] === 20
}

function fireNat20Confetti() {
  confetti({
    particleCount: 150,
    spread: 80,
    startVelocity: 45,
    origin: { y: 0.65 },
  })
}

type Props = {
  code: string
  userId: string
}

export function ConnectedRoom({ code, userId }: Readonly<Props>) {
  const channelName = `room:${code}`
  return (
    <ChannelProvider
      channelName={channelName}
      options={{
        modes: ['PUBLISH', 'SUBSCRIBE', 'PRESENCE', 'PRESENCE_SUBSCRIBE'],
        // Channel rewind delivers the last 100 messages on attach so users who
        // join late see the room's history. Without persistence enabled in the
        // Ably dashboard, this is bounded to the live store (~2 min); with
        // persistence on, it goes back further (24h+ depending on plan).
        params: { rewind: '100' },
      }}
    >
      <ConnectedRoomInner code={code} userId={userId} />
    </ChannelProvider>
  )
}

function ConnectedRoomInner({ code, userId }: Readonly<Props>) {
  const channelName = `room:${code}`
  const { profile, setProfile, isLoaded: profileLoaded } = useUserProfile()
  const { addVisit } = useVisitedRooms()
  const { rolls, append: appendRoll } = usePersistedRolls(
    `dice-log:rolls:room:${code}`,
  )
  const { chats, append: appendChat } = usePersistedChats(
    `dice-log:chats:room:${code}`,
  )

  useEffect(() => {
    addVisit(code)
  }, [addVisit, code])

  // Memoize so the update-on-edit effect below doesn't fire on every render.
  const presenceData = useMemo(
    () => ({ name: profile?.name, image: profile?.image }),
    [profile?.name, profile?.image],
  )

  // ably/react's `usePresence` enters once with whatever the prop is at the
  // first non-skipped render and never re-enters when the prop changes (see
  // the "messageOrPresenceObjectRef" comment in the lib). So we have to skip
  // until we actually have a profile — not just until localStorage has loaded
  // — otherwise a brand-new visitor enters as { name: undefined } and the
  // later `updateStatus` (after they fill in the prompt) races with the
  // in-flight enter and frequently leaves other clients showing Anonymous.
  const { updateStatus } = usePresence(
    { channelName, skip: !profileLoaded || !profile },
    presenceData,
  )

  // Forward subsequent profile edits (e.g. the user changes their name from
  // inside the room) to the live presence record. Skip until we've actually
  // entered — `updateStatus` throws otherwise — which now lines up with the
  // skip condition on `usePresence`.
  useEffect(() => {
    if (!profileLoaded || !profile) return
    updateStatus(presenceData).catch(error => {
      console.error('Failed to update presence', error)
    })
  }, [profileLoaded, profile, updateStatus, presenceData])

  const { requestRoll, playRemote, busy } = useRollExecutor({
    userId,
    name: profile?.name,
    image: profile?.image,
    onLocalResult: result => {
      appendRoll(result)
      if (isSoloNat20(result)) fireNat20Confetti()
      void publish('roll', result)
    },
  })

  const handleIncoming = useCallback(
    async (message: Ably.Message) => {
      // Skip echoes of our own publish — the local flow already appended (and,
      // for rolls, animated) this exact item.
      if (message.clientId === userId) return
      if (message.name === 'roll') {
        const result = message.data as RollResult
        appendRoll(result)
        if (
          isSoloNat20(result) &&
          Date.now() - result.at <= FRESH_ROLL_WINDOW_MS
        ) {
          fireNat20Confetti()
        }
        await playRemote(result)
      } else if (message.name === 'chat') {
        appendChat(message.data as ChatMessage)
      }
    },
    [appendRoll, appendChat, playRemote, userId],
  )

  const { publish } = useChannel(channelName, handleIncoming)

  const sender: RollerInfo = useMemo(
    () => ({ id: userId, name: profile?.name, image: profile?.image }),
    [userId, profile?.name, profile?.image],
  )

  const handleSendMessage = useCallback(
    (text: string) => {
      const message: ChatMessage = {
        id: crypto.randomUUID(),
        at: Date.now(),
        sender,
        text,
      }
      appendChat(message)
      void publish('chat', message)
    },
    [sender, appendChat, publish],
  )

  const needsProfile = profileLoaded && !profile

  return (
    <>
      <RoomView
        userId={userId}
        rolls={rolls}
        chats={chats}
        onRollRequest={requestRoll}
        onSendMessage={handleSendMessage}
        disabled={busy || needsProfile}
        header={<RoomHeader code={code} channelName={channelName} />}
      />
      {needsProfile && <ProfilePromptModal onSave={setProfile} />}
    </>
  )
}

function RoomHeader({
  code,
  channelName,
}: Readonly<{ code: string; channelName: string }>) {
  const [copied, setCopied] = useState(false)
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current)
    },
    [],
  )

  const handleShare = async () => {
    if (globalThis.window === undefined) return
    await copyTextToClipboard(`${globalThis.location.origin}/room/${code}`)
    setCopied(true)
    if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current)
    copiedTimeoutRef.current = setTimeout(() => setCopied(false), 2000)
  }
  return (
    <header className='flex items-center justify-between gap-2 border-b border-border-light bg-appbar p-3'>
      <div className='flex flex-1 items-center gap-1'>
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
        <PlayersButton channelName={channelName} />
      </div>
      <div className='flex flex-col items-center'>
        <span className='text-[10px] uppercase tracking-widest text-text-secondary'>
          Room
        </span>
        <span className='font-mono text-base font-semibold text-text-primary'>
          {code}
        </span>
      </div>
      <div className='flex flex-1 items-center justify-end gap-1'>
        <DicePreferencesButton />
        <Button
          intent='text-secondary'
          variant='ghost'
          size='lg'
          icon={Copy}
          onClick={handleShare}
          aria-label='Copy room link'
          className='min-w-20 justify-between'
        >
          {copied ? 'Copied' : 'Share'}
        </Button>
      </div>
    </header>
  )
}
