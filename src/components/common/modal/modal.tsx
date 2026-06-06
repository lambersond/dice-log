'use client'

import { useRef, useEffect, useState } from 'react'
import clsx from 'clsx'
import { X } from 'lucide-react'
import { IconButton } from '../buttons/icon-button'
import { popoverRegistry } from '../popover-registry'
import type { ModalProps } from './types'

export function Modal({
  children,
  headerClassName = '',
  isOpen,
  onClose,
  title,
  subtitle,
  dismissable = true,
  width = '',
  fullHeight = false,
  fullScreen = false,
  disableContainerStyles = false,
  containerClassName = '',
}: Readonly<ModalProps>) {
  const headerRef = useRef<HTMLDivElement>(null)
  const [headerHeight, setHeaderHeight] = useState(52)
  // If a dropdown/popover was open when the user pressed the mouse on the
  // backdrop, swallow the resulting click — they were dismissing the
  // dropdown, not the modal.
  const popoverOpenOnMouseDownRef = useRef(false)

  const handleBackdropMouseDown = () => {
    popoverOpenOnMouseDownRef.current = popoverRegistry.size() > 0
  }
  const handleBackdropClick = () => {
    if (popoverOpenOnMouseDownRef.current) {
      popoverOpenOnMouseDownRef.current = false
      return
    }
    if (!dismissable) return
    onClose()
  }

  useEffect(() => {
    if (!headerRef.current) return

    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight)
      }
    }

    updateHeaderHeight()

    const resizeObserver = new ResizeObserver(updateHeaderHeight)
    resizeObserver.observe(headerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [isOpen, headerClassName])

  useEffect(() => {
    if (!isOpen || !dismissable) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, dismissable, onClose])

  if (!isOpen) return

  const headerClassNames = clsx(
    'flex justify-between items-center p-3',
    headerClassName,
  )

  return (
    <div className='fixed inset-0 flex items-center justify-center z-1200'>
      <summary
        className='absolute inset-0 bg-black opacity-75'
        data-testid='modal__backdrop'
        onMouseDown={handleBackdropMouseDown}
        onClick={handleBackdropClick}
      />
      <div
        data-testid='modal'
        className={clsx(
          'relative bg-paper z-1500 overflow-hidden shadow-lg h-full sm:rounded-none',
          {
            'sm:rounded-xl min-w-full sm:min-w-sm sm:w-auto': !fullScreen,
            'min-w-full w-full min-h-full': fullScreen,
            // Default sizing only applies when the caller hasn't provided a
            // `width` override — otherwise these fixed widths fight the
            // override (e.g. `!max-w-5xl` looks ignored because the modal
            // stays pinned at `md`).
            'max-w-2xl w-sm md:w-md': !fullScreen && !width,
            'sm:h-fit': !fullHeight,
          },
          width,
        )}
      >
        <div className={headerClassNames} ref={headerRef}>
          <div>
            <p className='text-2xl font-bold text-text-primary'>{title}</p>
            {subtitle}
          </div>
          {dismissable && (
            <IconButton
              icon={X}
              onClick={onClose}
              size='lg'
              dataTestId='CloseIcon'
            />
          )}
        </div>
        <div
          style={{
            maxHeight: `calc(100vh - ${headerHeight}px)`,
            height: fullScreen ? `calc(100vh - ${headerHeight}px)` : 'auto',
          }}
          className={clsx(
            {
              'overflow-y-auto p-3 h-full md:h-unset': !disableContainerStyles,
            },
            containerClassName,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
