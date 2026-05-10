import { use } from 'react'
import { ModalDispatchCtx } from '@/components/modals/modal-context'
import type { Modal, ModalMap } from '@/types/modals'

export const useModals = () => {
  const dispatch = use(ModalDispatchCtx)

  if (!dispatch) {
    throw new Error('useModals must be used within a ModalProvider')
  }

  const openModal = (
    modal: Modal,
    props: Parameters<ModalMap[typeof modal]>[0],
  ) => dispatch({ type: 'open', modal, props })

  const closeModal = (modal: Modal) => dispatch({ type: 'close', modal })

  return { openModal, closeModal }
}
