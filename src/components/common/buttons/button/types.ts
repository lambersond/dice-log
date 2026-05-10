import type { ButtonHTMLAttributes, ElementType, ReactNode } from 'react'

export type ButtonIntent =
  | 'primary'
  | 'normal'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'text-primary'
  | 'text-secondary'

export type ButtonVariant = 'filled' | 'outline' | 'ghost'

export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

export type ButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> & {
  children: ReactNode
  icon?: ElementType
  size?: ButtonSize
  intent?: ButtonIntent
  variant?: ButtonVariant
  tooltip?: string
  dataTestId?: string
}
