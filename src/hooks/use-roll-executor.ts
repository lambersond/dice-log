'use client'

/* eslint-disable camelcase -- dice-box-threejs config keys are snake_case */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDice } from '@/hooks/dice'
import { useDiceBoxThreejs } from '@/hooks/dice/use-dice-box-threejs'
import {
  CUSTOM_COLORSET_KEY,
  useDicePreferences,
} from '@/hooks/use-dice-preferences'
import { executeRoll, toDiceBoxNotation } from '@/utils/roll-dice'
import { withTimeout } from '@/utils/with-timeout'
import type {
  RollRequest,
  RollResult,
  RollTheme,
  RollerInfo,
} from '@/types/roll'

/** Don't animate rolls older than this — they came in via rewind/history. */
const FRESH_ROLL_WINDOW_MS = 30_000

/**
 * Hard cap on how long we'll wait for the 3D animation before giving up on it.
 * A lost/hung WebGL context must never pin `busy` (and thus the Roll button)
 * forever — the roll is already logged and broadcast by this point regardless.
 */
const ANIMATION_TIMEOUT_MS = 12_000

type Options = {
  userId: string
  /**
   * Roller's current display name. The caller owns the profile state and
   * passes it in — calling `useUserProfile()` here would create a second
   * state instance that wouldn't see the caller's `setProfile` updates, so
   * dice rolls would keep showing the name we read at mount (e.g. undefined
   * for a brand-new visitor who later fills in the prompt).
   */
  name?: string
  image?: string
  onLocalResult: (result: RollResult) => void
  /**
   * Fires once the local roll's dice have come to rest (the animation promise
   * resolves on physics settle). Use this for reactions that shouldn't pre-empt
   * the dice — e.g. crit confetti, which would otherwise spoil the result while
   * the d20 is still tumbling across the screen.
   */
  onSettled?: (result: RollResult) => void
}

type DiceBoxLike = {
  updateConfig: (config: Record<string, unknown>) => Promise<void>
}

const hasUpdateConfig = (value: unknown): value is DiceBoxLike =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as { updateConfig?: unknown }).updateConfig === 'function'

export function useRollExecutor({
  userId,
  name,
  image,
  onLocalResult,
  onSettled,
}: Options) {
  const { preferences } = useDicePreferences()
  const dice = useDice()
  const dicebox = useDiceBoxThreejs()
  const [busy, setBusy] = useState(false)

  const roller = useMemo<RollerInfo>(
    () => ({ id: userId, name, image }),
    [userId, name, image],
  )

  // Keep latest prefs in a ref so callbacks can read fresh values without
  // re-creating themselves (which would churn `useChannel` subscriptions).
  const prefsRef = useRef(preferences)
  useEffect(() => {
    prefsRef.current = preferences
  }, [preferences])

  // Apply a roll's theme to the box, then run the animation. Concurrent rolls
  // are serialized inside `useDice.roll` (its rollChain); the second call gets
  // routed to dice-box's `add()` so dice from multiple users accumulate on
  // the table during the dwell. Each spawn uses the theme set right before
  // its animation, so every user's dice render in their own colours.
  const playRoll = useCallback(
    async (result: RollResult) => {
      if (result.theme && hasUpdateConfig(dicebox)) {
        await dicebox.updateConfig(themeConfig(result.theme)).catch(error_ => {
          console.error('Failed to apply roll theme', error_)
        })
      }
      if (dice.isInitialized) {
        // Bound the animation: a lost/hung GL context shouldn't keep the caller
        // waiting (and, for local rolls, hold the Roll button) indefinitely.
        await withTimeout(
          dice.roll(toDiceBoxNotation(result)),
          ANIMATION_TIMEOUT_MS,
          'dice animation',
        )
      }
    },
    [dice, dicebox],
  )

  const requestRoll = useCallback(
    async (request: RollRequest) => {
      if (busy) return
      setBusy(true)

      const result = executeRoll(request, roller)
      const prefs = prefsRef.current
      const theme: RollTheme = {
        colorset: prefs.colorset,
        material: prefs.material,
      }
      if (prefs.colorset === CUSTOM_COLORSET_KEY) {
        theme.customColor = prefs.customColor
      }
      result.theme = theme

      // Record + broadcast FIRST so a failed or janky 3D render can never cost
      // the roll. The animation is decorative; the log is the source of truth.
      onLocalResult(result)

      // Then animate as a bounded, non-fatal side effect. `busy` stays set
      // through the animation to debounce rapid rolls, but the timeout in
      // playRoll guarantees it's always released.
      try {
        await playRoll(result)
        // Dice are now at rest — safe to fire post-settle reactions.
        onSettled?.(result)
      } catch (error_) {
        console.error('Dice animation failed', error_)
      } finally {
        setBusy(false)
      }
    },
    [busy, onLocalResult, onSettled, playRoll, roller],
  )

  const playRemote = useCallback(
    async (result: RollResult) => {
      // Skip animations for stale messages (channel rewind / history replay).
      if (Date.now() - result.at > FRESH_ROLL_WINDOW_MS) return
      // Non-fatal: the incoming message was already appended to the log by the
      // caller, so a failed/timed-out render must not disrupt message handling.
      await playRoll(result).catch(error_ => {
        console.error('Remote dice animation failed', error_)
      })
    },
    [playRoll],
  )

  return { requestRoll, playRemote, busy }
}

/**
 * Builds the dice-box `updateConfig` payload for a roll's theme. Custom-color
 * rolls feed `theme_customColorset` instead of a preset key — the library uses
 * `customColorset` when present and falls back to `theme_colorset` otherwise.
 */
function themeConfig(theme: RollTheme): Record<string, unknown> {
  if (theme.colorset === CUSTOM_COLORSET_KEY && theme.customColor) {
    return {
      theme_customColorset: {
        name: `custom-${theme.customColor}`,
        foreground: '#ffffff',
        background: theme.customColor,
        outline: theme.customColor,
        texture: 'none',
      },
      theme_material: theme.material,
    }
  }
  return {
    theme_colorset: theme.colorset,
    theme_material: theme.material,
  }
}
