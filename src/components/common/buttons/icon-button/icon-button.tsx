'use client'

import { useRef, useState } from 'react'
import clsx from 'clsx'
import { Tooltip } from '../../tooltip'
import type { IconButtonProps } from './types'

export function IconButton({
  icon: Icon,
  actionIcon: ActionIcon,
  onClick,
  tooltip,
  text,
  size = 'md',
  intent = 'normal',
  border = false,
  className,
  dataTestId = 'icon-button',
  'aria-label': ariaLabel,
}: Readonly<IconButtonProps>) {
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const [loadingState, setLoadingState] = useState<
    'idle' | 'loading' | 'loaded'
  >('idle')

  const sizeClasses = clsx({
    'size-4': size === 'sm',
    'size-5': size === 'md',
    'size-6': size === 'lg',
    'size-7': size === 'xl',
  })

  const intentClasses = clsx({
    'text-primary hover:bg-primary/10': intent === 'primary',
    'text-text-tertiary hover:bg-text-tertiary/10': intent === 'normal',
    'text-success hover:bg-success/10': intent === 'success',
    'text-warning hover:bg-warning/10': intent === 'warning',
    'text-danger hover:bg-danger/10': intent === 'danger',
    'text-info hover:bg-info/10': intent === 'info',
    'text-text-primary hover:bg-text-primary/10': intent === 'text-primary',
    'text-text-secondary hover:bg-text-secondary/10':
      intent === 'text-secondary',
  })

  const borderClasses = border
    ? clsx({
        'border border-primary': intent === 'primary',
        'border border-text-tertiary': intent === 'normal',
        'border border-success': intent === 'success',
        'border border-warning': intent === 'warning',
        'border border-danger': intent === 'danger',
        'border border-info': intent === 'info',
        'border border-text-primary': intent === 'text-primary',
        'border border-text-secondary': intent === 'text-secondary',
      })
    : ''

  const layoutClasses = text
    ? clsx('gap-2', {
        'px-2 py-1 text-xs rounded-sm': size === 'sm',
        'px-3 py-1.5 text-sm rounded-md': size === 'md',
        'px-4 py-2 text-base rounded-lg': size === 'lg',
        'px-5 py-2.5 text-lg rounded-xl': size === 'xl',
      })
    : 'p-1 text-sm rounded'

  const buttonClasses = clsx(
    'flex items-center cursor-pointer h-fit',
    layoutClasses,
    intentClasses,
    borderClasses,
    className,
  )

  const handleClick = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    setLoadingState('loading')
    if (onClick) {
      await Promise.resolve(onClick(e))
    }
    setLoadingState('loaded')

    clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      setLoadingState('idle')
    }, 1500)
  }

  const ShowIcon = loadingState === 'loaded' && ActionIcon ? ActionIcon : Icon

  const buttonElement = (
    <button
      type='button'
      className={buttonClasses}
      onClick={ActionIcon ? handleClick : onClick}
      data-testid={dataTestId}
      aria-label={ariaLabel}
    >
      <ShowIcon className={sizeClasses} />
      {text && <span>{text}</span>}
    </button>
  )

  if (tooltip) {
    return (
      <Tooltip title={tooltip} placement='bottom' asChild>
        {buttonElement}
      </Tooltip>
    )
  }

  return buttonElement
}
