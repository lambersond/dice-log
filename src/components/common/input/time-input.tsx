'use client'

import { useEffect, useState } from 'react'

export function TimeInput({
  value = 300,
  onChange,
}: Readonly<{
  value?: number
  disabled?: boolean
  onChange: (seconds: number) => void
}>) {
  const minutes = Math.floor(value / 60)
  const seconds = value % 60
  const [text, setText] = useState(
    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
  )

  const handleInputChange = (raw: string) => {
    const cleaned = raw.replaceAll(/[^\d:]/g, '')

    let formatted = cleaned
    if (/^\d{3,4}$/.test(cleaned)) {
      formatted = cleaned.slice(0, 2) + ':' + cleaned.slice(2, 4)
    }

    setText(formatted)

    const [mm, ss] = formatted.split(':')

    if (mm?.length === 2 && ss?.length === 2) {
      const m = Number.parseInt(mm, 10)
      const s = Number.parseInt(ss, 10)

      if (!Number.isNaN(m) && !Number.isNaN(s) && s <= 59) {
        onChange(m * 60 + s)
      }
    }
  }

  const handleBlur = () => {
    const minutes = Math.floor(value / 60)
    const seconds = value % 60
    setText(
      `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    )
  }

  useEffect(() => {
    setText(
      `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`,
    )
  }, [value])

  return (
    <input
      type='text'
      value={text}
      onChange={e => handleInputChange(e.target.value)}
      onBlur={handleBlur}
      maxLength={5}
      className='w-54 text-center font-mono text-6xl rounded-md bg-tertiary focus:outline-none focus:ring-2 focus:ring-info tracking-thin'
      placeholder='MM:SS'
    />
  )
}
