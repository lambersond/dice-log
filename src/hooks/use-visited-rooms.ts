'use client'

import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'dice-log:visited-rooms'
const MAX_VISITS = 10

export type RoomVisit = {
  code: string
  at: number
}

const isVisit = (value: unknown): value is RoomVisit => {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Partial<RoomVisit>
  return typeof v.code === 'string' && typeof v.at === 'number'
}

const read = (): RoomVisit[] => {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isVisit)
  } catch {
    return []
  }
}

const write = (visits: RoomVisit[]) => {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(visits))
  } catch {
    // quota / private mode — non-fatal
  }
}

export function useVisitedRooms() {
  const [visits, setVisits] = useState<RoomVisit[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setVisits(read())
    setIsLoaded(true)
  }, [])

  const addVisit = useCallback((code: string) => {
    setVisits(prev => {
      const filtered = prev.filter(v => v.code !== code)
      const next = [{ code, at: Date.now() }, ...filtered].slice(0, MAX_VISITS)
      write(next)
      return next
    })
  }, [])

  return { visits, addVisit, isLoaded }
}
