import { useModals } from '../use-modals'
import { Avatar } from '@/components/avatar'
import { Modal } from '@/components/common'
import type { PlayersModalProps } from './types'

export default function PlayersModal({
  open = true,
  players = [],
}: Readonly<PlayersModalProps>) {
  const { closeModal } = useModals()

  const onClose = () => {
    closeModal('players')
  }

  return (
    <Modal
      title={`Players (${players.length})`}
      isOpen={open}
      onClose={onClose}
      width='max-w-sm'
      disableContainerStyles
    >
      {players.length === 0 ? (
        <p className='p-6 text-center text-sm text-text-secondary'>
          No one in the room yet.
        </p>
      ) : (
        <ul className='flex max-h-[60vh] flex-col divide-y divide-border-light overflow-y-auto'>
          {players.map(p => (
            <li key={p.id} className='flex items-center gap-3 p-3'>
              <Avatar
                name={p.name}
                image={p.image}
                seed={p.id}
                className='size-12'
              />
              <span className='truncate text-base text-text-primary'>
                {p.name?.trim() || 'Anonymous'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}
