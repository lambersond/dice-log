import type { Modal, ModalAction, ModalState } from '@/types/modals'

export const modalReducer = (
  state: ModalState,
  action: ModalAction<Modal>,
): ModalState => {
  switch (action.type) {
    case 'open': {
      return { ...state, [action.modal]: { open: true, props: action.props } }
    }
    case 'close': {
      return { ...state, [action.modal]: { open: false, props: {} } }
    }
    default: {
      throw new Error(`Unhandled action type: ${action}`)
    }
  }
}
