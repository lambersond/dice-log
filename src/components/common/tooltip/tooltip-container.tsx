'use client'

import {
  TooltipContext,
  useTooltip,
  type TooltipOptions,
} from './tooltip-context'

type Props = { children: React.ReactNode } & TooltipOptions

export function TooltipContainer({ children, ...options }: Readonly<Props>) {
  const tooltip = useTooltip(options)
  return (
    <TooltipContext.Provider value={tooltip}>
      {children}
    </TooltipContext.Provider>
  )
}
