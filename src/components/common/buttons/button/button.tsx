'use client'

import clsx from 'clsx'
import { Tooltip } from '../../tooltip'
import type { ButtonIntent, ButtonProps, ButtonVariant } from './types'

export function Button({
  children,
  icon: Icon,
  size = 'md',
  intent = 'primary',
  variant = 'filled',
  tooltip,
  dataTestId = 'button',
  className,
  type = 'button',
  ...rest
}: Readonly<ButtonProps>) {
  const iconSize = clsx({
    'size-4': size === 'sm' || size === 'md',
    'size-5': size === 'lg',
    'size-6': size === 'xl',
  })

  const layoutClasses = clsx('gap-2', {
    'px-2 py-1 text-xs rounded-sm': size === 'sm',
    'px-3 py-1.5 text-sm rounded-md': size === 'md',
    'px-4 py-2 text-base rounded-lg': size === 'lg',
    'px-5 py-2.5 text-lg rounded-xl': size === 'xl',
  })

  const variantClasses = getVariantClasses(intent, variant)

  const buttonClasses = clsx(
    'inline-flex items-center font-medium cursor-pointer h-fit',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    getFocusRingClass(intent),
    'disabled:opacity-50 disabled:cursor-not-allowed',
    layoutClasses,
    variantClasses,
    className,
  )

  const buttonElement = (
    <button
      {...rest}
      type={type}
      className={buttonClasses}
      data-testid={dataTestId}
    >
      {Icon && <Icon className={iconSize} aria-hidden='true' />}
      <span>{children}</span>
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

function getVariantClasses(intent: ButtonIntent, variant: ButtonVariant) {
  if (variant === 'filled') return FILLED_CLASSES[intent]
  if (variant === 'outline') return OUTLINE_CLASSES[intent]
  return GHOST_CLASSES[intent]
}

function getFocusRingClass(intent: ButtonIntent) {
  return FOCUS_RING_CLASSES[intent]
}

const FILLED_CLASSES: Record<ButtonIntent, string> = {
  primary: 'bg-primary text-white hover:opacity-90',
  normal: 'bg-text-tertiary text-white hover:opacity-90',
  success: 'bg-success text-white hover:opacity-90',
  warning: 'bg-warning text-white hover:opacity-90',
  danger: 'bg-danger text-white hover:opacity-90',
  info: 'bg-info text-white hover:opacity-90',
  'text-primary': 'bg-text-primary text-white hover:opacity-90',
  'text-secondary': 'bg-text-secondary text-white hover:opacity-90',
}

const OUTLINE_CLASSES: Record<ButtonIntent, string> = {
  primary: 'border border-primary text-primary hover:bg-primary/10',
  normal:
    'border border-text-tertiary text-text-tertiary hover:bg-text-tertiary/10',
  success: 'border border-success text-success hover:bg-success/10',
  warning: 'border border-warning text-warning hover:bg-warning/10',
  danger: 'border border-danger text-danger hover:bg-danger/10',
  info: 'border border-info text-info hover:bg-info/10',
  'text-primary':
    'border border-text-primary text-text-primary hover:bg-text-primary/10',
  'text-secondary':
    'border border-text-secondary text-text-secondary hover:bg-text-secondary/10',
}

const GHOST_CLASSES: Record<ButtonIntent, string> = {
  primary: 'text-primary hover:bg-primary/10',
  normal: 'text-text-tertiary hover:bg-text-tertiary/10',
  success: 'text-success hover:bg-success/10',
  warning: 'text-warning hover:bg-warning/10',
  danger: 'text-danger hover:bg-danger/10',
  info: 'text-info hover:bg-info/10',
  'text-primary': 'text-text-primary hover:bg-text-primary/10',
  'text-secondary': 'text-text-secondary hover:bg-text-secondary/10',
}

const FOCUS_RING_CLASSES: Record<ButtonIntent, string> = {
  primary: 'focus:ring-primary',
  normal: 'focus:ring-text-tertiary',
  success: 'focus:ring-success',
  warning: 'focus:ring-warning',
  danger: 'focus:ring-danger',
  info: 'focus:ring-info',
  'text-primary': 'focus:ring-text-primary',
  'text-secondary': 'focus:ring-text-secondary',
}
