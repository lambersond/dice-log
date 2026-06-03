'use client'

import { useMemo } from 'react'
import {
  DicePreferencesProvider,
  localStoragePreferences,
} from '@lambersond/3d-dice-react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ModalProvider } from '../modals/modal-provider'
import { AblyProvider } from '@/providers/ably'

export function SessionWrapper({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <NextThemesProvider
      attribute='class'
      defaultTheme='system'
      enableSystem
      disableTransitionOnChange
    >
      <main className='bg-page font-sans h-screen overflow-hidden'>
        <div className='flex flex-col h-full'>
          <Providers>{children}</Providers>
        </div>
      </main>
    </NextThemesProvider>
  )
}

function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  // Dice preferences (colour/material) persist under one key app-wide so a
  // player's dice look the same solo or together. Hoisted above ModalProvider
  // so the centralised dice-preferences modal — rendered by ModalManager here,
  // not in the room tree — can read the context.
  const storage = useMemo(
    () => localStoragePreferences('dice-log:dice-preferences'),
    [],
  )
  return (
    <AblyProvider>
      <DicePreferencesProvider storage={storage}>
        <ModalProvider>{children}</ModalProvider>
      </DicePreferencesProvider>
    </AblyProvider>
  )
}
