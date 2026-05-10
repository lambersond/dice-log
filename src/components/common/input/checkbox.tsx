'use client'

import { useEffect, useId, useState } from 'react'
import clsx from 'clsx'
import { CheckSquare, Square } from 'lucide-react'
import { Info } from '../info'
import { isLargeSize, isMediumSize, isSmallSize } from '../utils'
import type { CheckboxProps } from './types'

export function Checkbox({
  label,
  name = 'checkbox',
  size = 'md',
  labelClassName = 'text-text-primary',
  defaultChecked,
  disabled = false,
  checked,
  onChange,
  id,
  direction = 'horizontal',
  textDirection = 'end',
  info,
  ...props
}: Readonly<CheckboxProps>) {
  const reactId = useId()
  const inputId = id ?? `${name}-${reactId}`

  const isControlled = typeof checked === 'boolean'
  const [internalChecked, setInternalChecked] = useState<boolean>(
    Boolean(defaultChecked),
  )

  useEffect(() => {
    if (isControlled) setInternalChecked(Boolean(checked))
  }, [checked, isControlled])

  const iconChecked = isControlled ? Boolean(checked) : internalChecked

  const classes = clsx(
    {
      'size-4': isSmallSize(size),
      'size-6': isMediumSize(size),
      'size-8': isLargeSize(size),
      'opacity-50 cursor-not-allowed': disabled,
    },
    'text-primary peer-hover:text-primary/80 duration-200 ease-in-out',
  )

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = event => {
    if (!isControlled) setInternalChecked(event.target.checked)
    onChange?.(event)
  }

  return (
    <label
      className={clsx(
        {
          'text-sm': isSmallSize(size),
          'text-md': isMediumSize(size),
          'text-lg': isLargeSize(size),
          'cursor-pointer': !disabled,

          'flex-row': direction === 'horizontal' && textDirection === 'end',
          'flex-row-reverse':
            direction === 'horizontal' && textDirection === 'start',
          'flex-col': direction === 'vertical' && textDirection === 'end',
          'flex-col-reverse items-center':
            direction === 'vertical' && textDirection === 'start',
        },
        'flex items-center w-fit',
        labelClassName,
      )}
      htmlFor={inputId}
    >
      <input
        id={inputId}
        name={name}
        type='checkbox'
        className='sr-only peer'
        defaultChecked={defaultChecked}
        checked={checked}
        onChange={handleChange}
        {...props}
        disabled={disabled}
      />
      {iconChecked ? (
        <CheckSquare className={`${classes} text-primary`} />
      ) : (
        <Square className={`${classes} text-text-secondary`} />
      )}
      <p
        className={clsx(
          {
            'mr-2': direction === 'horizontal' && textDirection === 'start',
            'ml-2': direction === 'horizontal' && textDirection === 'end',
          },
          'select-none flex items-center gap-1',
          labelClassName,
        )}
      >
        {label}
        {info && <Info info={info} />}
      </p>
    </label>
  )
}
