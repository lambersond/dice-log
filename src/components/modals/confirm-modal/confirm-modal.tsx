import { useModals } from '../use-modals'
import { Modal } from '@/components/common'
import type { ConfirmModalProps } from './types'

export default function ConfirmModal({
  onConfirm,
  open = true,
  message = 'Are you sure you want to proceed?',
  title = 'Confirmation',
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  hideCancelButton = false,
  color = 'primary',
}: Readonly<ConfirmModalProps>) {
  const { closeModal } = useModals()

  const onClose = () => {
    closeModal('confirm')
  }

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Modal title={title} isOpen={open} onClose={onClose}>
      <span className='my-8 font-bold italic text-text-primary text-xl'>
        {message}
      </span>
      <div className='flex justify-end mt-4 gap-2'>
        {!hideCancelButton && (
          <button onClick={onClose} className={colorMap.cancel[color]}>
            {cancelButtonText}
          </button>
        )}
        <button onClick={handleConfirm} className={colorMap.confirm[color]}>
          {confirmButtonText}
        </button>
      </div>
    </Modal>
  )
}

const colorMap = {
  confirm: {
    primary:
      'bg-primary/85 py-2 px-4 hover:bg-primary rounded-xl text-lg text-text-secondary uppercase text-center font-bold cursor-pointer flex items-center justify-center gap-2',
    danger:
      'px-4 py-2 bg-danger/90 text-white/90 hover:text-white hover:bg-danger cursor-pointer rounded-lg text-lg font-bold uppercase',
  },
  cancel: {
    primary:
      'border border-secondary py-2 px-4 hover:border-primary rounded-xl text-lg text-secondary uppercase text-center font-bold cursor-pointer flex items-center justify-center gap-2',
    danger:
      'px-4 py-2 text-border-light border-2 border-border-light hover:text-text-primary/70 hover:border-text-primary/70 hover:text-text-primary/70 cursor-pointer rounded-lg text-lg font-bold uppercase',
  },
}
