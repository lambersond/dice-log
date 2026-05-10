import type { ModalProps } from '../types'

export interface ConfirmModalProps extends ModalProps {
  onConfirm: VoidFunction
  message?: string | React.ReactNode
  title?: string
  confirmButtonText?: string
  cancelButtonText?: string
  hideCancelButton?: boolean
  color?: 'primary' | 'danger'
}
