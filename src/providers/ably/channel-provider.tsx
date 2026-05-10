'use client'

import { ChannelProvider } from 'ably/react'

export function AblyChannelProvider({
  children,
  channel,
}: Readonly<{ children: React.ReactNode; channel: string }>) {
  return (
    <ChannelProvider
      channelName={channel}
      options={{
        modes: ['PRESENCE', 'PUBLISH', 'SUBSCRIBE', 'PRESENCE_SUBSCRIBE'],
      }}
    >
      {children}
    </ChannelProvider>
  )
}
