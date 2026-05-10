import { type ComponentType, Suspense, use } from 'react'
import { ModalStateCtx } from './modal-context'
import { MODALS } from '@/modals'
import type { Modal, ModalEntry } from '@/types/modals'

export function ModalManager() {
  const state = use(ModalStateCtx)

  if (!state) return

  // Only mount open modals — closed entries linger in state but the modal
  // shouldn't keep its inner state (form defaults, dropdown selections, etc.)
  // between opens. Unmounting on close means the next open is a fresh
  // component that picks up the new props verbatim.
  const entries = (Object.entries(state) as Array<[Modal, ModalEntry]>).filter(
    ([, entry]) => entry.open,
  )

  const modals = entries.map(([modal, entry]) => {
    const Component = MODALS[modal] as ComponentType<any>

    return (
      <Suspense key={modal}>
        <Component open={entry.open} {...entry.props} />
      </Suspense>
    )
  })

  return <>{modals}</>
}
