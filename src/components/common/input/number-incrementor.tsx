'use client'

import { useState } from 'react'
import type { NumberIncrementorProps } from './types'

export function NumberIncrementor({
  defaultValue = 0,
  value: controlledValue,
  onChange,
}: Readonly<NumberIncrementorProps>) {
  const [internalValue, setInternalValue] = useState(defaultValue)

  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue

  const updateValue = (next: number) => {
    if (!isControlled) setInternalValue(next)
    onChange?.(next)
  }

  const handleDecrement = () => updateValue(value - 1)
  const handleIncrement = () => updateValue(value + 1)

  const handleInputChange: React.ChangeEventHandler<
    HTMLInputElement
  > = event => {
    const parsed = Number.parseInt(event.target.value, 10)
    if (!Number.isNaN(parsed)) updateValue(parsed)
  }

  return (
    <div
      className=' w-fit flex items-center border border-border-light rounded-md overflow-hidden bg-white
        focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10'
    >
      <button
        onClick={handleDecrement}
        className='size-8 flex items-center justify-center bg-tertiary border-none
          cursor-pointer text-text-secondary text-base font-medium transition-all
          duration-200 select-none hover:bg-paper hover:text-text-primary
          active:bg-text-secondary active:scale-95
          disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-tertiary
          disabled:text-text-secondary disabled:hover:bg-tertiary disabled:hover:text-text-secondary'
      >
        -
      </button>
      <input
        type='number'
        value={value}
        className='
          w-8 h-8 border-none text-center text-sm text-text-primary bg-paper
          outline-none font-medium
          [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0
          [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0
          [&[type=number]]:[-moz-appearance:textfield]
        '
        onChange={handleInputChange}
      />
      <button
        onClick={handleIncrement}
        className='size-8 flex items-center justify-center bg-tertiary border-none
          cursor-pointer text-text-secondary text-base font-medium transition-all
          duration-200 select-none hover:bg-paper hover:text-text-primary
          active:bg-text-secondary active:scale-95
          disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-tertiary
          disabled:text-text-secondary disabled:hover:bg-tertiary disabled:hover:text-text-secondary'
      >
        +
      </button>
    </div>
  )
}
