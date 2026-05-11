'use client'

import { useEffect, useState } from 'react'
import { Avatar } from '@/components/avatar'
import { Button } from '@/components/common'
import { ProfileForm } from '@/components/profile'
import { useUserProfile, type UserProfile } from '@/hooks/use-user-profile'

type Mode = 'loading' | 'setup' | 'welcome' | 'edit'

export function ProfileCard() {
  const { profile, setProfile, isLoaded } = useUserProfile()
  const [mode, setMode] = useState<Mode>('loading')

  useEffect(() => {
    if (mode !== 'loading' || !isLoaded) return
    setMode(profile ? 'welcome' : 'setup')
  }, [isLoaded, profile, mode])

  if (mode === 'loading') {
    return <div className='h-32 animate-pulse rounded-lg bg-card' />
  }

  if (mode === 'welcome' && profile) {
    return <WelcomeBack profile={profile} onEdit={() => setMode('edit')} />
  }

  return (
    <ProfileForm
      initial={profile}
      autoSave={mode === 'setup'}
      onSave={next => {
        setProfile(next)
        if (mode === 'edit') setMode('welcome')
      }}
      onCancel={mode === 'edit' ? () => setMode('welcome') : undefined}
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
