import { forwardRef } from 'react'
import clsx from 'clsx'
import type { TextAreaProps } from './types'

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea(
    {
      label,
      error,
      className = '',
      name = 'textarea',
      hint,
      hideError = false,
      ...props
    },
    ref,
  ) {
    const classes = clsx(
      'mt-1 block w-full appearance-none rounded-md bg-transparent border border-border-light focus:border-primary px-3 py-2 outline-none placeholder:text-text-secondary',
      className,
    )

    return (
      <div className='flex flex-col mb-2'>
        {!!label && (
          <label
            className='text-[11px] font-semibold text-text-secondary uppercase tracking-widest'
            htmlFor={name}
          >
            {label}
            {props.required && <sup className='text-danger'>*</sup>}
          </label>
        )}
        <textarea
          id={name}
          name={name}
          className={classes}
          ref={ref}
          {...props}
        />
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
  },
)
