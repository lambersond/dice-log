'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input } from '@/components/common'
import { generateRoomCode, normalizeRoomCode } from '@/utils/room-code'

export function RoomActions() {
  const router = useRouter()
  const [code, setCode] = useState('')

  const goTo = (path: string) => router.push(path)

  return (
    <div className='flex flex-col gap-4 rounded-lg border border-border-light bg-paper p-4'>
      <h2 className='text-lg font-semibold text-text-primary'>Pick a room</h2>

      <form
        className='flex items-end gap-2'
        onSubmit={e => {
          e.preventDefault()
          const normalized = normalizeRoomCode(code)
          if (normalized) goTo(`/room/${normalized}`)
        }}
      >
        <div className='flex-1'>
          <Input
            label='Join with a code'
            name='room-code'
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder='ABC123'
            hideError
          />
        </div>
        <Button
          intent='primary'
          size='lg'
          type='submit'
          disabled={!code.trim()}
        >
          Join
        </Button>
      </form>

      <div className='flex flex-col gap-2 sm:flex-row'>
        <Button
          intent='primary'
          variant='outline'
          className='flex-1 justify-center'
          onClick={() => goTo(`/room/${generateRoomCode()}`)}
        >
          Make a room
        </Button>
        <Button
          intent='normal'
          variant='outline'
          className='flex-1 justify-center'
          onClick={() => goTo('/lonely')}
        >
          Lonely time
        </Button>
      </div>
    </div>
  )
}
