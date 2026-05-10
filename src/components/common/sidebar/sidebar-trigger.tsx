'use client'

import { cloneElement } from 'react'
import type { SidebarTriggerProps } from './types'

export function SidebarTrigger({
  setOpen,
  trigger,
}: Readonly<SidebarTriggerProps>) {
  const handleTriggerClick = () => setOpen(o => !o)

  const triggerElement = cloneElement(
    trigger as React.ReactElement,
    {
      onClick: (e: React.MouseEvent) => {
        const originalOnClick = ((trigger as React.ReactElement).props as any)
          .onClick
        originalOnClick?.(e)
        handleTriggerClick()
      },
      'data-testid': 'sidebar__button',
    } as React.HTMLAttributes<HTMLButtonElement>,
  )

  return triggerElement
}
