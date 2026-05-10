import type { Placement } from '@floating-ui/react'

export type TooltipProps = {
  children: React.ReactNode
  title?: React.ReactNode
  placement?: Placement
  asChild?: boolean
  contentContainerClasses?: string
}
