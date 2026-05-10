'use client'

import { useEffect, useState } from 'react'

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

/* eslint-disable camelcase -- library config uses snake_case keys */
const DICE_BOX_CONFIG = {
  assetPath: '/assets/dice-box-threejs/',
  sounds: true,
  shadows: true,
  theme_surface: 'green-felt',
  theme_colorset: 'white',
  theme_material: 'glass',
  gravity_multiplier: 400,
  light_intensity: 0.8,
  strength: 1,
}
/* eslint-enable camelcase */

// Module-level singleton so every useDiceBoxThreejs() caller shares one instance
let sharedDiceBox: unknown
let initPromise: Promise<void> | undefined

export function useDiceBoxThreejs() {
  const [diceBox, setDiceBox] = useState(sharedDiceBox)

  useEffect(() => {
    if (sharedDiceBox) {
      setDiceBox(sharedDiceBox)
      return
    }

    let cancelled = false

    initPromise ??= (async () => {
      const container = ensureContainer()

      // Wait one frame so the browser lays out the container
      await new Promise(requestAnimationFrame)

      if (container.clientWidth === 0 || container.clientHeight === 0) {
        console.warn('[dice] Container has zero dimensions', {
          w: container.clientWidth,
          h: container.clientHeight,
        })
        return
      }

      // Dynamic import avoids SSR issues — the library references browser globals
      const { default: DiceBox } = await import('@3d-dice/dice-box-threejs')

      const box = new DiceBox(`#${CONTAINER_ID}`, DICE_BOX_CONFIG)
      await box.initialize()
      sharedDiceBox = box
    })()

    initPromise
      .then(() => {
        if (!cancelled && sharedDiceBox) {
          setDiceBox(sharedDiceBox)
        }
      })
      .catch(error => {
        console.error('[dice] Failed to initialize DiceBox:', error)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return diceBox
}
