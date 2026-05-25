'use client'

import { useDiceBoxThreejs } from './use-dice-box-threejs'

/** NOTE
 * The @ts-ignores are due to the fact that the 3d Dice Box library
 * does not have TypeScript types available.
 */

const CONTAINER_SELECTOR = '#dice-canvas-threejs'

/** How long the dice layer takes to dissolve out once a roll's dwell ends. */
const EXIT_DURATION_MS = 450

function getContainer() {
  return document.querySelector<HTMLElement>(CONTAINER_SELECTOR)
}

function showContainer(el: HTMLElement) {
  el.style.opacity = '1'
}

function hideContainer(el: HTMLElement) {
  // By the time this runs the dice have already shrunk to nothing in the 3D
  // scene, so just drop the (now-empty) layer out.
  el.style.opacity = '0'
}

/**
 * Shrinks each die in place (3D mesh scale 1 -> 0) over EXIT_DURATION_MS, then
 * tears the dice down with clearDice(). Scaling the meshes — rather than the
 * shared canvas element — keeps every die collapsing around its own center
 * instead of drifting toward screen-center. We drive our own render loop
 * because the library stops rendering once a throw settles.
 *
 * If a new roll starts mid-shrink, activeRollCount is no longer 0; that roll
 * owns the table (its throw clears the old dice), so we bail out.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- untyped lib internals
function shrinkAndClear(db: any, container: HTMLElement | null) {
  const dice: Array<{ scale?: { setScalar: (n: number) => void } }> =
    Array.isArray(db?.diceList) ? [...db.diceList] : []

  const finish = () => {
    db?.clearDice?.()
    if (container) hideContainer(container)
  }

  if (dice.length === 0) {
    finish()
    return
  }

  const start = performance.now()
  const tick = (now: number) => {
    if (activeRollCount !== 0) return
    const progress = Math.min((now - start) / EXIT_DURATION_MS, 1)
    const scale = Math.max(1 - progress, 0.0001)
    for (const die of dice) die.scale?.setScalar(scale)
    db?.renderer?.render?.(db.scene, db.camera)
    if (progress < 1) {
      requestAnimationFrame(tick)
    } else {
      finish()
    }
  }
  requestAnimationFrame(tick)
}

// Shared across all useDice() instances so concurrent rolls from different
// hooks (actions vs message-handlers) coordinate visibility correctly.
let activeRollCount = 0

// Serializes dice animations so add() never runs while the library is
// mid-animation — its startClickThrow() clears all dice if this.rolling is true.
let rollChain: Promise<void> = Promise.resolve()

type DiceNotation = string | string[]
type VoidPromiseFunction = () => Promise<void>
type RollOptions = { timeout?: number; themeColor?: string }
type UseDiceBox = {
  isInitialized: boolean
  show: VoidPromiseFunction
  roll: (notation: DiceNotation, options?: RollOptions) => Promise<number[]>
  rollWithValue: (
    notation: DiceNotation,
    targetValue: number,
    options?: RollOptions,
  ) => Promise<void>
  hide: VoidPromiseFunction
}

export function useDice(): UseDiceBox {
  const dicebox = useDiceBoxThreejs()
  const isInitialized = !!dicebox

  async function applyThemeColor(color?: string) {
    if (!color || !dicebox) return
    const config = {
      // eslint-disable-next-line camelcase
      theme_customColorset: {
        name: `custom-${color}`,
        foreground: '#ffffff',
        background: color,
        outline: color,
        texture: 'none',
      },
    }
    // @ts-ignore — library config uses snake_case keys
    await dicebox.updateConfig(config)
  }

  async function roll(notation: DiceNotation, options?: RollOptions) {
    const { timeout = 1000, themeColor } = options ?? {}

    assert(
      isInitialized,
      'DiceBox is not initialized. Please ensure the dice box is set up correctly.',
    )

    await applyThemeColor(themeColor)

    const container = getContainer()
    if (container) showContainer(container)

    const isFirst = activeRollCount === 0
    activeRollCount += 1

    // Serialize dice animations — the library's startClickThrow() clears all
    // dice if called while a previous animation is still running.
    const prevChain = rollChain
    let resolveThis!: () => void
    rollChain = new Promise<void>(r => {
      resolveThis = r
    })

    // Wait for the previous animation to finish before starting ours
    await prevChain

    const db = dicebox as any
    let result: any
    try {
      result = isFirst ? await db.roll(notation) : await db.add(notation)
    } finally {
      // Animation is done — unblock the next queued roll
      resolveThis()
    }

    setTimeout(() => {
      activeRollCount -= 1
      if (activeRollCount === 0) {
        shrinkAndClear(db, container)
      }
    }, timeout)

    // roll() returns { sets: [{ rolls: [{ value }] }] }
    // add() returns [{ value, ... }] — one entry per added die
    if (isFirst) {
      // @ts-ignore
      return (
        result?.sets?.flatMap((set: { rolls: { value: number }[] }) =>
          set.rolls.map((r: { value: number }) => r.value),
        ) ?? []
      )
    }
    // add() result: array of individual die objects
    if (Array.isArray(result)) {
      return result.map((r: { value: number }) => r.value)
    }
    return []
  }

  async function rollWithValue(
    notation: DiceNotation,
    targetValue: number,
    options?: RollOptions,
  ) {
    const deterministicNotation = `${notation}@${targetValue}`
    await roll(deterministicNotation, options)
  }

  return {
    isInitialized,
    roll,
    rollWithValue,
    show: async () => {
      const c = getContainer()
      if (c) showContainer(c)
    },
    hide: async () => {
      const c = getContainer()
      if (c) hideContainer(c)
    },
  }
}

function assert(check: boolean, message: string) {
  if (!check) throw new Error(message)
}
