'use client'

type Props = {
  value: number
  min: number
  max: number
  width: number
  onChange: (value: number) => void
  'aria-label'?: string
}

export function TimeNumber({
  value,
  min,
  max,
  width,
  onChange,
  ...rest
}: Readonly<Props>) {
  return (
    <input
      {...rest}
      type='number'
      min={min}
      max={max}
      value={String(value).padStart(width, '0')}
      onChange={e => {
        const raw = Number.parseInt(e.target.value, 10)
        if (Number.isNaN(raw)) return
        if (raw < min || raw > max) return
        onChange(raw)
      }}
      className='w-10 bg-transparent text-center font-mono text-sm
        text-text-primary outline-none [appearance:textfield]
        [&::-webkit-inner-spin-button]:appearance-none
        [&::-webkit-outer-spin-button]:appearance-none'
      style={{ width: `${width + 1}ch` }}
    />
  )
}
