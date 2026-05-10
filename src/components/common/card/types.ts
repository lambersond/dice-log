import type { ElementType, ReactNode } from 'react'

export type CardProps = {
  icon: ElementType
  title: string
  description?: string | null
  href?: string
  viewLabel?: string
  action?: ReactNode
  children?: ReactNode
  className?: string
}
