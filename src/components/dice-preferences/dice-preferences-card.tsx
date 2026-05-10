'use client'

import { useState } from 'react'
import { DicePreferencesModal } from './dice-preferences-modal'
import { findColorset } from './presets'
import { Button } from '@/components/common'
import {
  CUSTOM_COLORSET_KEY,
  useDicePreferences,
} from '@/hooks/use-dice-preferences'

export function DicePreferencesCard() {
  const [open, setOpen] = useState(false)
  const { preferences, isLoaded } = useDicePreferences()

  if (!isLoaded) {
    return <div className='h-20 animate-pulse rounded-lg bg-card' />
  }

  const isCustom = preferences.colorset === CUSTOM_COLORSET_KEY
  const preset = isCustom ? undefined : findColorset(preferences.colorset)
  const swatchBg = isCustom
    ? preferences.customColor
    : (preset?.background ?? '#ffffff')
  const swatchFg = isCustom ? '#ffffff' : (preset?.foreground ?? '#000000')
  const themeName = isCustom ? 'Custom' : (preset?.name ?? 'Default')

  return (
    <>
      <div className='flex items-center gap-4 rounded-lg border border-border-light bg-paper p-4'>
        <span
          className='inline-flex size-12 shrink-0 items-center justify-center rounded-md border border-black/10 font-mono text-sm font-bold'
          style={{ backgroundColor: swatchBg, color: swatchFg }}
        >
          20
        </span>
        <div className='flex flex-1 flex-col gap-0.5'>
          <p className='text-base font-semibold text-text-primary'>
            {themeName}
          </p>
          <p className='text-xs capitalize text-text-secondary'>
            {preferences.material}
          </p>
        </div>
        <Button
          intent='normal'
          variant='outline'
          size='sm'
          onClick={() => setOpen(true)}
        >
          Customize
        </Button>
      </div>
      {open && <DicePreferencesModal onClose={() => setOpen(false)} />}
    </>
  )
}
