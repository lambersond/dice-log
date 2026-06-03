'use client'

import { ProfileForm } from './profile-form'
import { type UserProfile } from '@/hooks/use-user-profile'

type Props = {
  onSave: (profile: UserProfile) => void
}

export function ProfilePromptModal({ onSave }: Readonly<Props>) {
  return (
    <dialog
      aria-modal='true'
      aria-label='Set up your profile'
      className='fixed inset-0 z-50 flex items-center justify-center px-4'
    >
      <div aria-hidden='true' className='absolute inset-0 bg-black/60' />
      <div className='relative z-10 w-full max-w-md'>
        <p className='mb-2 text-center text-sm text-text-secondary'>
          Before you join, pick a name so others can see who you are.
        </p>
        <ProfileForm onSave={onSave} title='Set up your profile' />
      </div>
    </dialog>
  )
}
