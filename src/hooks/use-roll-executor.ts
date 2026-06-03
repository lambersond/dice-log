'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  executeNonDetRoll,
  executeRoll,
  themeToBoxConfig,
  toDiceBoxNotation,
  type PhysicalThrow,
  type RemovalOptions,
  type RollRequest,
} from '@lambersond/3d-dice-core'
import { useDicePreferences, useDiceRenderer } from '@lambersond/3d-dice-react'
import { withTimeout } from '@/utils/with-timeout'
import type { RollEntry, RollerInfo } from '@/types/roll'

const FRESH_ROLL_WINDOW_MS = 30_000
const ANIMATION_TIMEOUT_MS = 30_000

// How rolled dice leave the table once they settle. App-owned and passed
// straight through to the engine per roll — change `style`/`dwellMs` here to
// retune it. Not synced over the wire, so it's a local viewing choice: each
// client removes its own dice however it likes (style: 'shrink' | 'fade').
const DICE_REMOVAL: RemovalOptions = { style: 'shrink', dwellMs: 1000 }

type Options = {
  userId: string
  name?: string
  image?: string
  onLocalResult: (result: RollEntry) => void
  onSettled?: (result: RollEntry) => void
  /**
   * Deterministic (default) computes the result up front and the dice are told
   * to land on it (`@values`) — required so every client in a room agrees.
   * Non-deterministic throws the dice for real and reads the result off the
   * physics (the `/lonely` solo path), so the result is only known once they
   * settle.
   */
  deterministic?: boolean
}

export function useRollExecutor({
  userId,
  name,
  image,
  onLocalResult,
  onSettled,
  deterministic = true,
}: Options) {
  const { theme } = useDicePreferences()
  const renderer = useDiceRenderer()
  // Count of in-flight local rolls. `busy` (any in flight) still drives the
  // button's disabled state, but it no longer *gates* rolling: the renderer
  // multiplexes concurrent/rapid requests into one live tumble (engine Phase 3),
  // so requests are never dropped while another is animating.
  const [pendingRolls, setPendingRolls] = useState(0)
  const busy = pendingRolls > 0

  const roller = useMemo<RollerInfo>(
    () => ({ id: userId, name, image }),
    [userId, name, image],
  )

  const themeRef = useRef(theme)
  useEffect(() => {
    themeRef.current = theme
  }, [theme])

  const playRoll = useCallback(
    async (result: RollEntry) => {
      if (!renderer.isReady) return
      // Bind the roller's theme to this roll (not a separate global
      // updateConfig) so coalesced bursts keep each roller's colours.
      await withTimeout(
        renderer.roll(toDiceBoxNotation(result), {
          theme: result.theme ? themeToBoxConfig(result.theme) : undefined,
          removal: DICE_REMOVAL,
        }),
        ANIMATION_TIMEOUT_MS,
        'dice animation',
      )
    },
    [renderer],
  )

  // The physical-roll primitive for non-deterministic rolls: throw a notation
  // and resolve with the values the dice land on.
  const throwDice = useCallback<PhysicalThrow>(
    notation =>
      withTimeout(
        renderer.roll(notation, {
          theme: themeRef.current
            ? themeToBoxConfig(themeRef.current)
            : undefined,
          removal: DICE_REMOVAL,
        }),
        ANIMATION_TIMEOUT_MS,
        'dice animation',
      ),
    [renderer],
  )

  const requestRoll = useCallback(
    async (request: RollRequest) => {
      // No busy gate: rapid/concurrent requests all flow to the renderer, which
      // coalesces them into one live tumble. `pendingRolls` only tracks how many
      // are animating (for the button's disabled state).
      setPendingRolls(n => n + 1)

      try {
        if (deterministic) {
          // result is known up front; log optimistically, then animate to it
          const result: RollEntry = {
            ...executeRoll(request),
            roller,
            theme: themeRef.current,
          }
          onLocalResult(result)
          await playRoll(result)
          onSettled?.(result)
        } else if (renderer.isReady) {
          // physics decides the result, so we can only log once it settles
          const base = await executeNonDetRoll(request, throwDice)
          const result: RollEntry = { ...base, roller, theme: themeRef.current }
          onLocalResult(result)
          onSettled?.(result)
        }
      } catch (error_) {
        console.error('Dice roll failed', error_)
      } finally {
        setPendingRolls(n => n - 1)
      }
    },
    [
      deterministic,
      onLocalResult,
      onSettled,
      playRoll,
      renderer,
      roller,
      throwDice,
    ],
  )

  const playRemote = useCallback(
    async (result: RollEntry) => {
      if (Date.now() - result.at > FRESH_ROLL_WINDOW_MS) return
      await playRoll(result).catch(error_ => {
        console.error('Remote dice animation failed', error_)
      })
    },
    [playRoll],
  )

  return { requestRoll, playRemote, busy }
}
