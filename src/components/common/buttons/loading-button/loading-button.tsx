'use client'

import { useRef, useState, type ReactNode } from 'react'
import clsx from 'clsx'

export function LoadingButton({
  Icon,
  hasEdit = false,
  loadedText = 'Loaded',
  loadedTextDurationMs = 2000,
  loadingIconClasses = 'text-white size-5',
  ...props
}: Readonly<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    Icon?: ReactNode
    loadedText?: string
    loadedTextDurationMs?: number
    loadingIconClasses?: string
    hasEdit?: boolean
  }
>) {
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const [loadingState, setLoadingState] = useState<
    'idle' | 'loading' | 'loaded'
  >('idle')

  if (hasEdit === false) return

  const handleClick = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    setLoadingState('loading')
    if (props.onClick) {
      await Promise.resolve(props.onClick(e))
    }
    setLoadingState('loaded')

    clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      setLoadingState('idle')
    }, loadedTextDurationMs)
  }

  return (
    <button
      {...props}
      onClick={handleClick}
      className={clsx(
        'flex gap-2 items-center transition-all duration-200 ease-in-out',
        {
          'cursor-pointer': loadingState !== 'loading',
          'cursor-not-allowed': loadingState === 'loading',
        },
        props.className,
      )}
    >
      {loadingState === 'loading' && (
        <div
          className={clsx(
            'inline-block animate-spin rounded-full border-solid border-current border-r-transparent border-2',
            loadingIconClasses,
          )}
        />
      )}
      {loadingState === 'loaded' && (
        <p className='text-center w-full'>{loadedText}</p>
      )}
      {loadingState === 'idle' && Icon}
      {loadingState !== 'loaded' && props.children}
    </button>
  )
}
