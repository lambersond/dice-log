'use client'

import { cloneElement, forwardRef, isValidElement } from 'react'
import { useMergeRefs } from '@floating-ui/react'
import { useTooltipContext } from './tooltip-context'

export const TooltipTrigger = forwardRef<
  HTMLElement,
  React.HTMLProps<HTMLElement> & { asChild?: boolean }
>(function TooltipTrigger({ children, asChild = false, ...props }, propRef) {
  const context = useTooltipContext()
  const childrenRef = (children as any).ref
  const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef])

  if (asChild && isValidElement(children)) {
    return cloneElement(
      children,
      context.getReferenceProps({
        ref,
        ...props,
        ...(children.props as Record<string, any>),
        'data-state': context.open ? 'open' : 'closed',
      } as any),
    )
  }

  return (
    <button
      ref={ref}
      className='w-fit'
      data-state={context.open ? 'open' : 'closed'}
      {...context.getReferenceProps(props)}
    >
      {children}
    </button>
  )
})
