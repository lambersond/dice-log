import { use, useMemo } from 'react'
import { ModalDispatchCtx } from '@/components/modals/modal-context'
import type { Modal, ModalMap } from '@/types/modals'

export const useModals = () => {
  const dispatch = use(ModalDispatchCtx)

  // Memoized so `openModal`/`closeModal` keep a stable identity across renders —
  // callers can safely list them in effect deps (e.g. a state-driven modal gate)
  // without retriggering. `dispatch` from useReducer is itself stable.
  const api = useMemo(() => {
    if (!dispatch) return
    return {
      openModal: (modal: Modal, props: Parameters<ModalMap[typeof modal]>[0]) =>
        dispatch({ type: 'open', modal, props }),
      closeModal: (modal: Modal) => dispatch({ type: 'close', modal }),
    }
  }, [dispatch])

  if (!api) {
    throw new Error('useModals must be used within a ModalProvider')
  }

  return api
}
