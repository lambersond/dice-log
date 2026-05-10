'use client'

import { useState } from 'react'
import clsx from 'clsx'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { isoToParts, partsToIso, type DateParts } from '../format'
import { MONTH_LABELS, WEEKDAY_LABELS } from './constants'
import { TimeNumber } from './time-number'
import { defaultParts, getCalendarCells, isBeforeDay } from './utils'

type Props = {
  value: string
  timezone: string
  onChange: (iso: string) => void
  onClear: () => void
  min?: string
}

export function Calendar({
  value,
  timezone,
  onChange,
  onClear,
  min,
}: Readonly<Props>) {
  const partsFromValue = isoToParts(value, timezone)
  const fallback =
    isoToParts(new Date().toISOString(), timezone) ?? defaultParts()
  const parts: DateParts = partsFromValue ?? fallback
  const minParts = min ? isoToParts(min, timezone) : undefined

  const [view, setView] = useState({ year: parts.year, month: parts.month })

  const setMonth = (year: number, month: number) => {
    const m = ((((month - 1) % 12) + 12) % 12) + 1
    const yearOffset = Math.floor((month - 1) / 12)
    setView({ year: year + yearOffset, month: m })
  }

  const updateParts = (next: Partial<DateParts>) => {
    onChange(partsToIso({ ...parts, ...next }, timezone))
  }

  const cells = getCalendarCells(view.year, view.month)
  const period = parts.hour >= 12 ? 'PM' : 'AM'
  const hour12 = parts.hour % 12 || 12

  return (
    <div
      className='flex flex-col gap-3 rounded-md border border-border-light
        bg-card p-3 shadow-md w-72'
    >
      <header className='flex items-center justify-between gap-2'>
        <div className='flex items-baseline gap-2 font-medium text-text-primary'>
          <span>{MONTH_LABELS[view.month - 1]}</span>
          <span className='text-text-secondary'>{view.year}</span>
        </div>
        <div className='flex items-center gap-1'>
          <button
            type='button'
            aria-label='Previous month'
            onClick={() => setMonth(view.year, view.month - 1)}
            className='rounded p-1 text-text-secondary hover:bg-hover'
          >
            <ChevronLeft className='size-4' aria-hidden='true' />
          </button>
          <button
            type='button'
            aria-label='Next month'
            onClick={() => setMonth(view.year, view.month + 1)}
            className='rounded p-1 text-text-secondary hover:bg-hover'
          >
            <ChevronRight className='size-4' aria-hidden='true' />
          </button>
        </div>
      </header>

      <div className='grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-text-secondary'>
        {WEEKDAY_LABELS.map(d => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className='grid grid-cols-7 gap-1'>
        {cells.map(cell => {
          const isSelected =
            partsFromValue !== undefined &&
            cell.year === parts.year &&
            cell.month === parts.month &&
            cell.day === parts.day
          const isInMonth = cell.year === view.year && cell.month === view.month
          const isBeforeMin =
            minParts !== undefined && isBeforeDay(cell, minParts)
          return (
            <button
              type='button'
              key={`${cell.year}-${cell.month}-${cell.day}`}
              disabled={isBeforeMin}
              onClick={() => {
                if (!isInMonth) {
                  setView({ year: cell.year, month: cell.month })
                }
                updateParts({
                  year: cell.year,
                  month: cell.month,
                  day: cell.day,
                })
              }}
              aria-pressed={isSelected}
              className={clsx(
                'aspect-square w-full rounded text-center text-sm',
                'focus:outline-none focus:ring-2 focus:ring-primary',
                isSelected && 'bg-primary text-white',
                !isSelected &&
                  isInMonth &&
                  !isBeforeMin &&
                  'text-text-primary hover:bg-hover',
                !isSelected &&
                  !isInMonth &&
                  !isBeforeMin &&
                  'text-text-tertiary hover:bg-hover',
                isBeforeMin &&
                  'text-text-tertiary opacity-40 cursor-not-allowed',
              )}
            >
              {cell.day}
            </button>
          )
        })}
      </div>

      <div className='flex items-center justify-between gap-1 rounded-md border border-border-light p-2'>
        <TimeNumber
          aria-label='Hour'
          min={1}
          max={12}
          width={2}
          value={hour12}
          onChange={n => {
            const next24 = period === 'PM' ? (n % 12) + 12 : n % 12
            updateParts({ hour: next24 })
          }}
        />
        <span className='text-text-secondary'>:</span>
        <TimeNumber
          aria-label='Minute'
          min={0}
          max={59}
          width={2}
          value={parts.minute}
          onChange={n => updateParts({ minute: n })}
        />
        <span className='text-text-secondary'>:</span>
        <TimeNumber
          aria-label='Second'
          min={0}
          max={59}
          width={2}
          value={parts.second}
          onChange={n => updateParts({ second: n })}
        />
        <span className='text-text-secondary'>.</span>
        <TimeNumber
          aria-label='Millisecond'
          min={0}
          max={999}
          width={3}
          value={parts.ms}
          onChange={n => updateParts({ ms: n })}
        />
        <button
          type='button'
          onClick={() => {
            const swap = period === 'AM' ? 'PM' : 'AM'
            const nextHour = swap === 'PM' ? (hour12 % 12) + 12 : hour12 % 12
            updateParts({ hour: nextHour })
          }}
          className='ml-1 rounded border border-border-light px-2 py-1 text-xs font-medium text-text-primary hover:bg-hover'
        >
          {period}
        </button>
      </div>

      <div className='flex items-center justify-between gap-2'>
        <button
          type='button'
          onClick={() => onChange(new Date().toISOString())}
          className='text-sm font-medium text-primary hover:underline'
        >
          Now
        </button>
        <button
          type='button'
          onClick={onClear}
          className='text-sm font-medium text-text-secondary hover:underline'
        >
          Clear
        </button>
      </div>
    </div>
  )
}
