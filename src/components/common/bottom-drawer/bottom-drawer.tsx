'use client'

import { useEffect, type ReactNode } from 'react'
import clsx from 'clsx'
import { X } from 'lucide-react'
import { IconButton } from '../buttons/icon-button'

type Props = {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  // Optional title rendered in the drawer's sticky header. The close button
  // sits to its right.
  title?: string
  // Tailwind height classes — defaults to a tall-but-not-full drawer that
  // works for documentation-length content. Override for shorter sheets.
  className?: string
}

// Slide-up drawer pinned to the bottom of the viewport. Built as a sibling
// of the existing right-side `Sidebar` rather than a generalization, since
// the styling assumptions (height vs. width, vertical vs. horizontal slide)
// don't share cleanly.
export function BottomDrawer({
  isOpen,
  onClose,
  children,
  title,
  className = 'max-h-[85vh] h-fit',
}: Readonly<Props>) {
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  return (
    <>
      {isOpen && (
        <button
          type='button'
          data-testid='bottom-drawer__overlay'
          aria-label='Close drawer'
          className='fixed inset-0 z-40 bg-black/40'
          onClick={onClose}
        />
      )}
      <div
        data-testid='bottom-drawer'
        aria-hidden={!isOpen}
        className={clsx(
          'fixed inset-x-0 bottom-0 z-50 flex flex-col overflow-hidden',
          'rounded-t-2xl bg-paper shadow-2xl',
          'transform transition-transform duration-200 ease-out',
          isOpen ? 'translate-y-0' : 'translate-y-full',
          className,
        )}
      >
        <header
          className='flex items-center justify-between gap-3 border-b
            border-border-light/60 px-5 py-3'
        >
          <h2 className='text-lg font-semibold text-text-primary'>
            {title ?? ''}
          </h2>
          <IconButton
            icon={X}
            onClick={onClose}
            size='md'
            dataTestId='bottom-drawer__close'
          />
        </header>
        <div className='overflow-y-auto px-5 py-4'>{children}</div>
      </div>
    </>
  )
}
