'use client'

/* eslint-disable camelcase -- dice-box-threejs config keys are snake_case */

import { useEffect } from 'react'
import { CUSTOM_COLORSET_KEY, useDicePreferences } from './use-dice-preferences'
import { useDiceBoxThreejs } from '@/hooks/dice/use-dice-box-threejs'

type DiceBoxLike = {
  updateConfig: (config: Record<string, unknown>) => Promise<void>
}

const hasUpdateConfig = (value: unknown): value is DiceBoxLike =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as { updateConfig?: unknown }).updateConfig === 'function'

/**
 * Pushes the user's saved dice preferences (theme + material) to the
 * shared dice-box instance whenever they change. Safe to call from any
 * component — the underlying dice-box is module-singleton.
 */
export function useDiceThemeSync() {
  const dicebox = useDiceBoxThreejs()
  const { preferences } = useDicePreferences()

  useEffect(() => {
    if (!hasUpdateConfig(dicebox)) return
    const config: Record<string, unknown> =
      preferences.colorset === CUSTOM_COLORSET_KEY
        ? {
            theme_customColorset: {
              name: `custom-${preferences.customColor}`,
              foreground: '#ffffff',
              background: preferences.customColor,
              outline: preferences.customColor,
              texture: 'none',
            },
            theme_material: preferences.material,
          }
        : {
            theme_colorset: preferences.colorset,
            theme_material: preferences.material,
          }
    dicebox.updateConfig(config).catch(error => {
      console.error('Failed to apply dice preferences', error)
    })
  }, [
    dicebox,
    preferences.colorset,
    preferences.material,
    preferences.customColor,
  ])
}
