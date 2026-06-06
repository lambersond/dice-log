'use client'

import { useModals } from '../use-modals'
import { Modal } from '@/components/common'
import { ProfileForm } from '@/components/profile'
import type { ProfilePromptModalProps } from './types'

export default function ProfilePromptModal({
  open = true,
  onSave,
}: Readonly<ProfilePromptModalProps>) {
  const { closeModal } = useModals()

  const handleSave = (profile: Parameters<typeof onSave>[0]) => {
    onSave(profile)
    closeModal('profile-prompt')
  }

  return (
    <Modal
      title='Set up your profile'
      subtitle={
        <p className='text-sm text-text-secondary'>
          Before you join, enter a name so others can see who you are.
        </p>
      }
      isOpen={open}
      onClose={() => closeModal('profile-prompt')}
      dismissable={false}
      width='max-w-md'
    >
      <ProfileForm onSave={handleSave} bare />
    </Modal>
  )
}
