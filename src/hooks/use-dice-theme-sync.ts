'use client'

import { useDicePreferences, useDiceTheme } from '@lambersond/3d-dice-react'

/**
 * Pushes the user's saved dice preferences to the shared renderer. Thin glue:
 * the provider derives the `RollTheme`, `useDiceTheme` applies it.
 */
export function useDiceThemeSync() {
  const { theme } = useDicePreferences()
  useDiceTheme(theme)
}
