import { cookies } from 'next/headers'
import { ConnectedRoom } from '@/components/room'
import { USER_ID_COOKIE } from '@/lib/user-cookies'
import { normalizeRoomCode } from '@/utils/room-code'

type Params = Promise<{ code: string }>

export default async function RoomPage({
  params,
}: Readonly<{ params: Params }>) {
  const { code } = await params
  const store = await cookies()
  const userId = store.get(USER_ID_COOKIE)?.value ?? 'anon'
  return <ConnectedRoom code={normalizeRoomCode(code)} userId={userId} />
}
