'use client'

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
  return (
    <AblyProvider>
      <ModalProvider>{children}</ModalProvider>
    </AblyProvider>
  )
}
