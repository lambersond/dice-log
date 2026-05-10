'use client'

import { createContext, useContext, useMemo, useState } from 'react'
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  type Placement,
} from '@floating-ui/react'

export interface TooltipOptions {
  placement?: Placement
}

export function useTooltip({ placement = 'top' }: TooltipOptions = {}) {
  const [open, setOpen] = useState(false)

  const data = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(8),
      flip({
        crossAxis: placement.includes('-'),
        fallbackAxisSideDirection: 'start',
        padding: 8,
      }),
      shift({ padding: 8 }),
    ],
  })

  const context = data.context

  const hover = useHover(context, {
    move: false,
    enabled: true,
    delay: {
      open: 200,
      close: 50,
    },
  })
  const focus = useFocus(context, {
    enabled: true,
  })
  const dismiss = useDismiss(context)
  const role = useRole(context, { role: 'tooltip' })

  const interactions = useInteractions([hover, focus, dismiss, role])

  return useMemo(
    () => ({
      open,
      setOpen,
      ...interactions,
      ...data,
    }),
    [open, setOpen, interactions, data],
  )
}

type ContextType = ReturnType<typeof useTooltip> | undefined

export const TooltipContext = createContext<ContextType>(undefined)

export const useTooltipContext = () => {
  const context = useContext(TooltipContext)

  return context as ReturnType<typeof useTooltip>
}
