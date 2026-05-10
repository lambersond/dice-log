import { type ReactNode, useReducer } from 'react'
import { ModalDispatchCtx, ModalStateCtx } from './modal-context'
import { ModalManager } from './modal-manager'
import { modalReducer } from './modal-reducer'
import type { ModalState } from '@/types/modals'

export function ModalProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [state, dispatch] = useReducer(modalReducer, {} as ModalState)

  return (
    <ModalDispatchCtx value={dispatch}>
      <ModalStateCtx value={state}>
        {children}
        <ModalManager />
      </ModalStateCtx>
    </ModalDispatchCtx>
  )
}
