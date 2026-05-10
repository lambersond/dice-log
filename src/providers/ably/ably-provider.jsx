'use client'

import { useEffect, useRef } from 'react'
import * as Ably from 'ably'
import { LiveObjects } from 'ably/liveobjects'
import { AblyProvider as AProvider } from 'ably/react'
import PropTypes from 'prop-types'

const RECOVERY_KEY = 'ably-recovery-key'
export const ABLY_RECONNECTED_EVENT = 'ably:reconnected'

function createClient() {
  const recoveryKey =
    globalThis.window === undefined
      ? undefined
      : sessionStorage.getItem(RECOVERY_KEY)

  if (recoveryKey) sessionStorage.removeItem(RECOVERY_KEY)

  return new Ably.Realtime({
    authUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/ably/token`,
    plugins: { LiveObjects },
    ...(recoveryKey ? { recover: recoveryKey } : {}),
  })
}

export function AblyProvider({ children }) {
  const clientRef = useRef(null)
  clientRef.current ??= createClient()
  const client = clientRef.current

  useEffect(() => {
    const reconnectIfNeeded = () => {
      if (client.connection.state !== 'connected') {
        client.connect()
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        reconnectIfNeeded()
      }
    }

    const handleBeforeUnload = () => {
      const key = client.connection.createRecoveryKey()
      if (key) sessionStorage.setItem(RECOVERY_KEY, key)
    }

    const handleConnected = stateChange => {
      const wasOffline =
        stateChange.previous === 'disconnected' ||
        stateChange.previous === 'suspended'

      if (wasOffline) {
        globalThis.dispatchEvent(new CustomEvent(ABLY_RECONNECTED_EVENT))
        console.warn('Ably reconnected after being offline')
      }
    }

    client.connection.on('connected', handleConnected)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    globalThis.addEventListener('online', reconnectIfNeeded)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      client.connection.off('connected', handleConnected)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      globalThis.removeEventListener('online', reconnectIfNeeded)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [client])

  return <AProvider client={client}>{children}</AProvider>
}

AblyProvider.propTypes = {
  children: PropTypes.node,
}
