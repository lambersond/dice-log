/* eslint-disable camelcase */
import { Geist, Geist_Mono } from 'next/font/google'
import { SessionWrapper } from '@/components/session-wrapper'
import type { Metadata, Viewport } from 'next'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Dice Log',
  description: 'A simple interface to roll dice together',
  // metadataBase: new URL('https://gr8-retros.app'),
  // openGraph: {
  //   title: 'Gr8 Retros',
  //   images: {
  //     url: '/logo.png',
  //     secureUrl: '/logo.png',
  //     alt: 'Gr8 Retros Logo',
  //     type: 'image/png',
  //     width: 64,
  //     height: 64,
  //   },
  // },
  robots: 'index,follow',
  creator: 'David Lamberson',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang='en'
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className='min-h-full flex flex-col'>
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  )
}
