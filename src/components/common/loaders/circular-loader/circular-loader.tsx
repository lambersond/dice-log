import clsx from 'clsx'
import { SIZE_CLASSES } from './constants'
import type { CircularLoaderProps } from './types'

export function CircularLoader({
  color = 'text-primary',
  size = 'md',
  label = 'Loading…',
  fullscreen = false,
}: Readonly<CircularLoaderProps>) {
  const spinnerClasses = clsx(
    'inline-block animate-spin rounded-full border-solid border-current border-r-transparent',
    SIZE_CLASSES[size],
    color,
  )

  const spinner = (
    <div className={spinnerClasses} aria-live='polite' aria-label={label}>
      <span className='sr-only'>{label}</span>
    </div>
  )

  if (!fullscreen) {
    return (
      <div className='flex h-full w-full items-center justify-center'>
        <div className='flex flex-col items-center gap-3'>
          {spinner}
          {!!label && <p className='text-sm text-text-primary/70'>{label}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm'>
      <div className='rounded-xl bg-appbar/90 p-6 shadow-xl'>
        <div className='flex flex-col items-center gap-3'>
          {spinner}
          {!!label && <p className='text-sm text-text-primary/70'>{label}</p>}
        </div>
      </div>
    </div>
  )
}
