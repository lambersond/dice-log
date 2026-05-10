import { forwardRef } from 'react'
import clsx from 'clsx'
import type { InputProps } from './types'

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    className = '',
    name = 'input',
    width = 'full',
    disabled = false,
    containerClassName = '',
    hint,
    hideError = false,
    endAdornment,
    ...props
  },
  ref,
) {
  const classes = clsx(
    'mt-1 block w-full appearance-none rounded-md bg-transparent border border-border-light focus:border-primary px-3 py-2 outline-none placeholder:text-text-secondary bg-paper',
    {
      'border-error focus:border-error focus:ring-error': !!error,
      'border-border-light focus:border-primary focus:ring-primary': !error,
      'cursor-not-allowed text-platinum': disabled,
      'pr-16': !!endAdornment,
    },
    className,
  )

  return (
    <div
      className={clsx(
        { 'w-full': width === 'full', 'w-auto': width === 'auto' },
        'flex flex-col',
        containerClassName,
      )}
    >
      {!!label && (
        <label
          className='text-[11px] font-semibold text-text-secondary uppercase tracking-widest'
          htmlFor={name}
        >
          {label}
          {props.required && <sup className='text-danger'>*</sup>}
        </label>
      )}
      <div className='relative'>
        <input
          id={name}
          name={name}
          className={classes}
          disabled={disabled}
          ref={ref}
          {...props}
        />
        {endAdornment && (
          <div className='absolute inset-y-0 right-2 flex items-center'>
            {endAdornment}
          </div>
        )}
      </div>
      {!!hint && (
        <span className='text-text-secondary text-xs italic h-4 mb-2'>
          {hint}
        </span>
      )}
      {!hideError && (
        <p className='text-danger text-xs italic h-4 mb-2'>{error}</p>
      )}
    </div>
  )
})
