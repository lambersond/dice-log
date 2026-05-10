import type { Metadata } from 'next'

export const metadata: Metadata = {
  // Rooms are private, ephemeral, and code-addressed. Keep them out of search
  // indexes so a leaked URL isn't archived by crawlers.
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
}

export default function RoomLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>
}
