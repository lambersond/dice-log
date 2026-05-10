'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  DEFAULT_COLORSET,
  DEFAULT_MATERIAL,
  MATERIALS,
  type DiceMaterial,
} from '@/components/dice-preferences/presets'

const STORAGE_KEY = 'dice-log:dice-preferences'

export const CUSTOM_COLORSET_KEY = 'custom'
export const DEFAULT_CUSTOM_COLOR = '#3e79ff'

export type DicePreferences = {
  /** Either a preset key from COLORSETS, or `'custom'` to use `customColor`. */
  colorset: string
  material: DiceMaterial
  /** Last-picked hex color. Always present so the picker remembers the value
   *  even when the user is on a preset theme. */
  customColor: string
}

const DEFAULTS: DicePreferences = {
  colorset: DEFAULT_COLORSET,
  material: DEFAULT_MATERIAL,
  customColor: DEFAULT_CUSTOM_COLOR,
}

const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/

const isDiceMaterial = (value: unknown): value is DiceMaterial =>
  typeof value === 'string' && (MATERIALS as readonly string[]).includes(value)

/**
 * Module-level singleton store. Every `useDicePreferences()` call subscribes
 * to the same state, so updates from one instance (e.g., the modal in the
 * room header) are visible to other instances (e.g., the room's roll
 * executor) immediately. This is what makes per-roll theme broadcasting
 * actually work — without it the executor publishes with stale prefs.
 */
type Listener = (prefs: DicePreferences) => void

let cache: DicePreferences = { ...DEFAULTS }
let cacheLoaded = false
const listeners = new Set<Listener>()

const readFromStorage = (): DicePreferences => {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS
    const parsed = JSON.parse(raw) as Partial<DicePreferences>
    return {
      colorset:
        typeof parsed.colorset === 'string'
          ? parsed.colorset
          : DEFAULTS.colorset,
      material: isDiceMaterial(parsed.material)
        ? parsed.material
        : DEFAULTS.material,
      customColor:
        typeof parsed.customColor === 'string' &&
        HEX_PATTERN.test(parsed.customColor)
          ? parsed.customColor
          : DEFAULTS.customColor,
    }
  } catch {
    return DEFAULTS
  }
}

const ensureCacheLoaded = () => {
  if (cacheLoaded) return
  cacheLoaded = true
  cache = readFromStorage()
}

const setCache = (updater: (prev: DicePreferences) => DicePreferences) => {
  ensureCacheLoaded()
  cache = updater(cache)
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(cache))
  } catch {
    // private mode / quota — keep state in-memory
  }
  for (const listener of listeners) listener(cache)
}

export function useDicePreferences() {
  // Initial render returns module cache (or DEFAULTS if not loaded yet — that
  // matches what the server renders, so hydration stays clean).
  const [preferences, setPreferences] = useState<DicePreferences>(cache)
  const [isLoaded, setIsLoaded] = useState(cacheLoaded)

  useEffect(() => {
    ensureCacheLoaded()
    setPreferences(cache)
    setIsLoaded(true)

    const listener: Listener = next => setPreferences(next)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const setColorset = useCallback((colorset: string) => {
    setCache(prev => ({ ...prev, colorset }))
  }, [])

  const setMaterial = useCallback((material: DiceMaterial) => {
    setCache(prev => ({ ...prev, material }))
  }, [])

  const setCustomColor = useCallback((customColor: string) => {
    setCache(prev => ({ ...prev, customColor }))
  }, [])

  return {
    preferences,
    setColorset,
    setMaterial,
    setCustomColor,
    isLoaded,
  }
}
