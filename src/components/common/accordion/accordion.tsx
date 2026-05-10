'use client'

import { useId, useState } from 'react'
import clsx from 'clsx'
import { ChevronDown } from 'lucide-react'
import type { AccordionProps } from './types'

// On md and up the panel is always rendered and the toggle button is hidden.
// All `md:` prefixes below must move together if the breakpoint changes.
export function Accordion({
  title,
  children,
  defaultOpen = false,
  className,
}: Readonly<AccordionProps>) {
  const headingId = useId()
  const panelId = useId()
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <section className={clsx('flex flex-col', className)}>
      <h3 id={headingId} className='text-lg font-semibold text-text-primary'>
        <button
          type='button'
          onClick={() => setIsOpen(open => !open)}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className='flex w-full cursor-pointer items-center justify-between
            gap-2 text-left md:hidden'
        >
          <span>{title}</span>
          <ChevronDown
            className={clsx(
              'size-5 shrink-0 text-text-secondary transition-transform',
              isOpen && 'rotate-180',
            )}
            aria-hidden='true'
          />
        </button>
        <span className='hidden md:inline'>{title}</span>
      </h3>
      <div
        id={panelId}
        role='region'
        aria-labelledby={headingId}
        className={clsx('mt-3', isOpen ? 'block' : 'hidden', 'md:block')}
      >
        {children}
      </div>
    </section>
  )
}
