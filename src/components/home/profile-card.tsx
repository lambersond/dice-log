'use client'

import { useState } from 'react'
import { Avatar } from '@/components/avatar'
import { Button } from '@/components/common'
import { ProfileForm } from '@/components/profile'
import { useUserProfile, type UserProfile } from '@/hooks/use-user-profile'

export function ProfileCard() {
  const { profile, setProfile, isLoaded } = useUserProfile()
  const [editing, setEditing] = useState(false)

  if (!isLoaded) {
    return <div className='h-32 animate-pulse rounded-lg bg-card' />
  }

  if (profile && !editing) {
    return <WelcomeBack profile={profile} onEdit={() => setEditing(true)} />
  }

  return (
    <ProfileForm
      initial={profile}
      onSave={next => {
        setProfile(next)
        setEditing(false)
      }}
      onCancel={profile ? () => setEditing(false) : undefined}
    />
  )
}

function WelcomeBack({
  profile,
  onEdit,
}: Readonly<{ profile: UserProfile; onEdit: () => void }>) {
  return (
    <div className='flex items-center gap-4 rounded-lg border border-border-light bg-paper p-4'>
      <Avatar name={profile.name} image={profile.image} className='size-16' />
      <div className='flex flex-1 flex-col gap-1'>
        <p className='text-lg font-semibold text-text-primary'>
          Welcome back, {profile.name}!
        </p>
        <Button
          intent='text-secondary'
          variant='ghost'
          size='sm'
          onClick={onEdit}
          className='self-start !px-1'
        >
          Edit profile
        </Button>
      </div>
    </div>
  )
}
