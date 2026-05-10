'use client'

import { TooltipContainer } from './tooltip-container'
import { TooltipContent } from './tooltip-content'
import { TooltipTrigger } from './tooltip-trigger'
import type { TooltipProps } from './types'

export function Tooltip({
  children,
  title,
  placement,
  contentContainerClasses = 'max-w-[calc(100vw_- _8px)] bg-card text-text-primary px-3 py-1 mb-1 rounded-lg shadow-md ring-1 ring-black/5 z-10000',
  asChild = false,
}: Readonly<TooltipProps>) {
  if (!title) return <>{children}</>

  return (
    <TooltipContainer placement={placement}>
      <TooltipTrigger asChild={asChild}>{children}</TooltipTrigger>
      <TooltipContent className={`tooltip ${contentContainerClasses}`}>
        {title}
      </TooltipContent>
    </TooltipContainer>
  )
}
