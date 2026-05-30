'use client'

import { useEffect, useReducer } from 'react'

const CONTAINER_ID = 'dice-canvas-threejs'

function ensureContainer() {
  let el = document.querySelector<HTMLElement>(`#${CONTAINER_ID}`)
  if (!el) {
    el = document.createElement('div')
    el.id = CONTAINER_ID
    // Inline styles guarantee dimensions before any stylesheet loads
    el.style.position = 'fixed'
    el.style.top = '0'
    el.style.left = '0'
    el.style.width = '100vw'
    el.style.height = '100vh'
    el.style.pointerEvents = 'none'
    el.style.zIndex = '100000'
    document.body.append(el)
  }
  return el
}

/**
 * Heuristic for "this device will struggle with the full-fat 3D scene." Shadow
 * mapping is a second render pass and a common trigger for WebGL context loss
 * under memory pressure on phones, so we drop it on coarse-pointer / mobile /
 * low-memory devices.
 */
function isLowPowerDevice() {
  if (typeof navigator === 'undefined') return false
  const coarse =
    typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches
  const mobileUA = /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent)
  const deviceMemory = (navigator as { deviceMemory?: number }).deviceMemory
  const lowMemory = typeof deviceMemory === 'number' && deviceMemory <= 4
  return coarse || mobileUA || lowMemory
}

/* eslint-disable camelcase -- library config uses snake_case keys */
function diceBoxConfig() {
  return {
    assetPath: '/assets/dice-box-threejs/',
    sounds: true,
    shadows: !isLowPowerDevice(),
    theme_surface: 'green-felt',
    theme_colorset: 'white',
    theme_material: 'glass',
    gravity_multiplier: 400,
    light_intensity: 0.8,
    strength: 1,
  }
}
/* eslint-enable camelcase */

// Module-level singleton so every useDiceBoxThreejs() caller shares one box.
let boxInstance: unknown
// True while the GL context is lost. three.js recovers its own resources on
// restore, so we keep the same instance but hide it (callers see `undefined`,
// so `dice.isInitialized` is false and rolls skip animation cleanly until the
// context comes back).
let contextLost = false
let building = false

// Consumers subscribe so a (re)build or context loss/restore re-renders them.
const subscribers = new Set<() => void>()
function notify() {
  for (const cb of subscribers) cb()
}

function currentBox() {
  return contextLost ? undefined : boxInstance
}

/** Wait up to ~1s for the fixed container to have non-zero dimensions. */
async function waitForDimensions(container: HTMLElement, frames = 60) {
  for (let i = 0; i < frames; i += 1) {
    if (container.clientWidth > 0 && container.clientHeight > 0) return true
    await new Promise(requestAnimationFrame)
  }
  return container.clientWidth > 0 && container.clientHeight > 0
}

function attachContextLossHandlers(box: unknown) {
  const canvas = (box as { renderer?: { domElement?: HTMLCanvasElement } })
    .renderer?.domElement
  if (!canvas) return

  canvas.addEventListener('webglcontextlost', event => {
    // preventDefault lets the browser attempt automatic restoration; three.js
    // also re-uploads its GL resources once the context is back.
    event.preventDefault()
    console.warn('[dice] WebGL context lost')
    contextLost = true
    notify()
  })

  canvas.addEventListener('webglcontextrestored', () => {
    console.warn('[dice] WebGL context restored')
    contextLost = false
    notify()
  })
}

async function buildBox() {
  if (boxInstance || building) return
  building = true
  try {
    const container = ensureContainer()
    const ready = await waitForDimensions(container)
    if (!ready) {
      console.warn('[dice] Container has zero dimensions; will retry on resume')
      return
    }

    // Dynamic import avoids SSR issues — the library references browser globals
    const { default: DiceBox } = await import('@3d-dice/dice-box-threejs')
    const box = new DiceBox(`#${CONTAINER_ID}`, diceBoxConfig())
    await box.initialize()

    boxInstance = box
    contextLost = false
    attachContextLossHandlers(box)
    notify()
  } catch (error) {
    console.error('[dice] Failed to initialize DiceBox:', error)
  } finally {
    building = false
  }
}

/**
 * Builds the box if we don't have one yet. Safe to call repeatedly — it no-ops
 * once a box exists, and retries if a previous attempt bailed (e.g. the room
 * mounted while hidden, so the container measured zero).
 */
function ensureBox() {
  if (!boxInstance && !building) void buildBox()
}

export function useDiceBoxThreejs() {
  // Re-render this consumer whenever the shared box changes.
  const [, forceRender] = useReducer((n: number) => n + 1, 0)

  useEffect(() => {
    subscribers.add(forceRender)
    ensureBox()

    // Returning to a backgrounded tab is the prime moment a zero-dimension
    // init can finally succeed (or a dropped context needs another build).
    const onVisible = () => {
      if (document.visibilityState === 'visible') ensureBox()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      subscribers.delete(forceRender)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return currentBox()
}
