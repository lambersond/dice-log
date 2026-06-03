'use client'

import { COLORSETS, CUSTOM_COLORSET_KEY } from '@lambersond/3d-dice-core'
import { useDicePreferences } from '@lambersond/3d-dice-react'
import { Button } from '../common'
import { useModals } from '@/components/modals/use-modals'

export function DicePreferencesButton() {
  const { openModal } = useModals()
  const { preferences } = useDicePreferences()

  const isCustom = preferences.colorset === CUSTOM_COLORSET_KEY
  const preset = COLORSETS.find(c => c.key === preferences.colorset)
  const name = isCustom ? 'Custom' : (preset?.name ?? 'Default')
  const background = isCustom ? preferences.customColor : preset?.background
  const foreground = isCustom ? '#ffffff' : preset?.foreground

  return (
    <Button
      onClick={() => openModal('dice-preferences', {})}
      aria-label={`Customize dice — current theme: ${name}`}
      variant='outline'
      size='lg'
    >
      <span
        className='-mt-1 inline-flex size-5 text-xs shrink-0 items-center justify-center rounded border border-black/10 font-mono '
        style={{ backgroundColor: background, color: foreground }}
        aria-hidden='true'
      >
        20
      </span>
      <span className='hidden max-w-24 size-5 truncate sm:inline ml-2'>
        {name}
      </span>
    </Button>
  )
}
