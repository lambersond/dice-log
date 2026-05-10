import { DiceBackground } from './dice-background'
import { ProfileCard } from './profile-card'
import { RoomActions } from './room-actions'
import { DicePreferencesCard } from '@/components/dice-preferences'

export function Home() {
  return (
    <>
      <DiceBackground />
      <div className='mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-12'>
        <header className='flex flex-col gap-1'>
          <h1 className='text-2xl font-bold tracking-tight text-text-primary'>
            Dice Log
          </h1>
          <p className='text-sm text-text-secondary'>
            Roll dice together, or alone. Whatever floats your dice.
          </p>
        </header>
        <ProfileCard />
        <DicePreferencesCard />
        <RoomActions />
      </div>
    </>
  )
}
