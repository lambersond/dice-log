'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { createPortal } from 'react-dom'
import { Calendar } from './calendar'
import {
  formatDisplay,
  getBrowserTimezone,
  getTimezoneInfo,
  parseDateInput,
} from './format'
import { TimezonePanel } from './timezone-panel'
import { Input } from '@/components/common/input'

type Props = {
  label?: string
  name?: string
  value: string
  onChange: (iso: string) => void
  defaultTimezone?: string
  required?: boolean
  error?: string
  hint?: string
  min?: string
}

type Position = { top: number; left: number }

const CALENDAR_SIZE = { width: 288, height: 380 }
const TZ_PANEL_SIZE = { width: 320, height: 288 }
const POPUP_MARGIN = 4

function clampToViewport(
  anchor: DOMRect,
  size: { width: number; height: number },
  align: 'left' | 'right',
): Position {
  const vw = globalThis.window?.innerWidth ?? 0
  const vh = globalThis.window?.innerHeight ?? 0

  // Vertical: prefer below, flip above if there isn't room below.
  let top = anchor.bottom + POPUP_MARGIN
  if (top + size.height > vh - POPUP_MARGIN) {
    const above = anchor.top - size.height - POPUP_MARGIN
    top =
      above >= POPUP_MARGIN
        ? above
        : Math.max(POPUP_MARGIN, vh - size.height - POPUP_MARGIN)
  }

  // Horizontal: align to anchor edge, clamp inside the viewport.
  let left = align === 'right' ? anchor.right - size.width : anchor.left
  if (left + size.width > vw - POPUP_MARGIN) {
    left = vw - size.width - POPUP_MARGIN
  }
  if (left < POPUP_MARGIN) left = POPUP_MARGIN

  return { top, left }
}

export function DateTimePicker({
  label,
  name = 'datetime',
  value,
  onChange,
  defaultTimezone,
  required = false,
  error,
  hint,
  min,
}: Readonly<Props>) {
  const inputId = useId()
  const [timezone, setTimezone] = useState(
    () => defaultTimezone ?? getBrowserTimezone(),
  )
  const [text, setText] = useState(() => formatDisplay(value, timezone))
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [tzOpen, setTzOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [calendarPos, setCalendarPos] = useState<Position | undefined>()
  const [tzPos, setTzPos] = useState<Position | undefined>()

  const containerRef = useRef<HTMLDivElement>(null)
  const inputWrapperRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLButtonElement>(null)

  // External changes (calendar pick, Clear, parent reset) and timezone
  // swaps reformat the input. Skip while the user is actively typing —
  // their unparseable in-progress text would otherwise get clobbered.
  useEffect(() => {
    if (focused) return
    setText(formatDisplay(value, timezone))
  }, [value, timezone, focused])

  // Outside-click and Escape close both popups. We listen during the
  // capture phase and stopPropagation when the click lands outside the
  // picker, so the click never reaches its target — including any modal
  // backdrop's close-on-click handler. Portaled popups mark themselves
  // with [data-datetime-portal] so clicks inside them aren't treated as
  // outside.
  useEffect(() => {
    if (!calendarOpen && !tzOpen) return
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (containerRef.current?.contains(target)) return
      if (target.closest('[data-datetime-portal]')) return
      e.stopPropagation()
      setCalendarOpen(false)
      setTzOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        setCalendarOpen(false)
        setTzOpen(false)
      }
    }
    document.addEventListener('click', onClick, true)
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('keydown', onKey, true)
    }
  }, [calendarOpen, tzOpen])

  // Compute positions when popups open. Anchored to viewport so they
  // escape any modal `overflow-hidden` clipping, and clamped inside
  // the viewport so they remain fully visible.
  useEffect(() => {
    if (!calendarOpen) return
    const rect = inputWrapperRef.current?.getBoundingClientRect()
    if (rect) setCalendarPos(clampToViewport(rect, CALENDAR_SIZE, 'left'))
  }, [calendarOpen])

  useEffect(() => {
    if (!tzOpen) return
    const rect = badgeRef.current?.getBoundingClientRect()
    if (rect) setTzPos(clampToViewport(rect, TZ_PANEL_SIZE, 'right'))
  }, [tzOpen])

  const tzInfo = getTimezoneInfo(timezone)

  const handleTextChange = (raw: string) => {
    setText(raw)
    const iso = parseDateInput(raw, timezone)
    if (iso) onChange(iso)
  }

  return (
    <div ref={containerRef} className='relative w-full'>
      {label && (
        <label
          htmlFor={inputId}
          className='text-[11px] font-semibold uppercase tracking-widest
            text-text-secondary'
        >
          {label}
          {required && <sup className='text-danger'>*</sup>}
        </label>
      )}
      <summary
        ref={inputWrapperRef}
        className='relative list-none [&::-webkit-details-marker]:hidden'
        onClick={e => {
          const target = e.target as HTMLElement
          if (target.closest('[data-tz-badge]')) return
          setTzOpen(false)
          setCalendarOpen(true)
        }}
      >
        <Input
          id={inputId}
          name={name}
          value={text}
          onChange={e => handleTextChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false)
            setText(formatDisplay(value, timezone))
          }}
          onPaste={e => {
            const pasted = e.clipboardData.getData('text')
            if (!pasted) return
            const iso = parseDateInput(pasted, timezone)
            if (iso) {
              e.preventDefault()
              onChange(iso)
              setText(formatDisplay(iso, timezone))
            }
          }}
          placeholder='Select a timestamp (MM/dd/yyyy, h:mm a)'
          error={error}
          hideError={!error}
          endAdornment={
            <button
              ref={badgeRef}
              type='button'
              data-tz-badge
              onClick={e => {
                e.stopPropagation()
                setCalendarOpen(false)
                setTzOpen(o => !o)
              }}
              className='inline-flex items-center gap-1 rounded px-1.5 py-0.5
                text-xs font-mono text-text-secondary hover:bg-hover
                focus:outline-none focus:ring-2 focus:ring-primary'
              aria-label='Change timezone'
            >
              {tzInfo.shortName}
              <ChevronDown
                aria-hidden='true'
                className='size-3 text-text-tertiary'
              />
            </button>
          }
        />
      </summary>

      {hint && !error && (
        <span className='text-text-secondary text-xs italic'>{hint}</span>
      )}

      {tzOpen &&
        tzPos &&
        globalThis.window !== undefined &&
        createPortal(
          <div
            data-datetime-portal
            className='fixed z-[9999]'
            style={{ top: tzPos.top, left: tzPos.left }}
          >
            <TimezonePanel
              value={timezone}
              onChange={tz => {
                setTimezone(tz)
                setTzOpen(false)
              }}
            />
          </div>,
          document.body,
        )}

      {calendarOpen &&
        calendarPos &&
        globalThis.window !== undefined &&
        createPortal(
          <div
            data-datetime-portal
            className='fixed z-[9999]'
            style={{ top: calendarPos.top, left: calendarPos.left }}
          >
            <Calendar
              value={value}
              timezone={timezone}
              onChange={iso => onChange(iso)}
              onClear={() => {
                onChange('')
                setCalendarOpen(false)
              }}
              min={min}
            />
          </div>,
          document.body,
        )}
    </div>
  )
}
