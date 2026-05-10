'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { getTimezoneInfo, listAllTimezones } from './format'

type Props = {
  value: string
  onChange: (timezone: string) => void
}

type Option = {
  id: string
  city: string
  longName: string
  shortName: string
  searchText: string
}

export function TimezonePanel({ value, onChange }: Readonly<Props>) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState('')

  const options = useMemo<ReadonlyArray<Option>>(() => {
    return listAllTimezones().map(tz => {
      const info = getTimezoneInfo(tz)
      return {
        id: tz,
        city: info.city,
        longName: info.longName,
        shortName: info.shortName,
        searchText:
          `${info.city} ${info.longName} ${info.shortName} ${tz}`.toLowerCase(),
      }
    })
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return options
    return options.filter(o => o.searchText.includes(q))
  }, [options, search])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div
      className='flex max-h-72 w-80 flex-col overflow-hidden rounded-md border
        border-border-light bg-card shadow-lg'
    >
      <div className='flex items-center gap-2 border-b border-border-light p-2'>
        <Search className='size-4 text-text-secondary' aria-hidden='true' />
        <input
          ref={inputRef}
          type='text'
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder='Search for timezones…'
          className='w-full appearance-none bg-transparent text-sm outline-none
            placeholder:text-text-secondary'
        />
      </div>
      <ul className='flex-1 overflow-y-auto'>
        {filtered.length === 0 && (
          <li className='px-3 py-2 text-sm italic text-text-secondary'>
            No timezones match
          </li>
        )}
        {filtered.map(option => {
          const isSelected = option.id === value
          return (
            <li key={option.id}>
              <button
                type='button'
                onClick={() => onChange(option.id)}
                aria-pressed={isSelected}
                className={
                  isSelected
                    ? 'flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm bg-primary/10 text-primary'
                    : 'flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-text-primary hover:bg-hover'
                }
              >
                <span className='truncate'>
                  {option.city}, {option.longName}
                </span>
                <span className='shrink-0 font-mono text-xs text-text-secondary'>
                  {option.shortName}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
