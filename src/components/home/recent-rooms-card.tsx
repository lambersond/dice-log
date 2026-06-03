'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useUserProfile } from '@/hooks/use-user-profile'
import { useVisitedRooms } from '@/hooks/use-visited-rooms'

const MS_PER_DAY = 86_400_000
const COLLAPSED_COUNT = 5

function relativeDays(at: number): string {
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const days = Math.round(
    (startOfDay(new Date()) - startOfDay(new Date(at))) / MS_PER_DAY,
  )
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  return `${days} days ago`
}

export function RecentRoomsCard() {
  const { profile, isLoaded: profileLoaded } = useUserProfile()
  const { visits, isLoaded: visitsLoaded } = useVisitedRooms()
  const [expanded, setExpanded] = useState(false)

  if (!profileLoaded || !visitsLoaded) return
  if (!profile) return
  if (visits.length === 0) return

  const hasMore = visits.length > COLLAPSED_COUNT
  const shown = expanded ? visits : visits.slice(0, COLLAPSED_COUNT)

  return (
    <div className='flex flex-col gap-2 rounded-lg border border-border-light bg-paper p-4'>
      <h2 className='text-lg font-semibold text-text-primary'>Recent rooms</h2>
      <ul className='flex flex-col'>
        {shown.map(v => (
          <li key={v.code}>
            <Link
              href={`/room/${v.code}`}
              className='flex items-center justify-between rounded-md px-2 py-2 hover:bg-hover'
            >
              <span className='font-mono text-sm font-semibold text-text-primary'>
                {v.code}
              </span>
              <span className='text-xs text-text-secondary'>
                {relativeDays(v.at)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {hasMore && (
        <button
          type='button'
          onClick={() => setExpanded(prev => !prev)}
          className='self-start rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:bg-hover'
        >
          {expanded ? 'Show less' : `Show all (${visits.length})`}
        </button>
      )}
    </div>
  )
}
