'use client'

import { useMemo, useState } from 'react'
import {
  COLORSETS,
  CUSTOM_COLORSET_KEY,
  MATERIALS,
  type ColorsetPreset,
  type DiceMaterial,
} from '@lambersond/3d-dice-core'
import { useDicePreferences } from '@lambersond/3d-dice-react'
import clsx from 'clsx'
import { Search } from 'lucide-react'
import { useModals } from '../use-modals'
import { ColorPicker, Modal } from '@/components/common'
import type { ModalProps } from '../types'

export default function DicePreferencesModal({
  open = true,
}: Readonly<ModalProps>) {
  const { closeModal } = useModals()
  const { preferences, setColorset, setMaterial, setCustomColor } =
    useDicePreferences()
  const [search, setSearch] = useState('')

  const onClose = () => {
    closeModal('dice-preferences')
  }

  const isCustomActive = preferences.colorset === CUSTOM_COLORSET_KEY

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return COLORSETS
    return COLORSETS.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q),
    )
  }, [search])

  const grouped = useMemo(() => {
    const map = new Map<string, ColorsetPreset[]>()
    for (const preset of filtered) {
      const list = map.get(preset.category) ?? []
      list.push(preset)
      map.set(preset.category, list)
    }
    return [...map.entries()]
  }, [filtered])

  return (
    <Modal
      title='Customize dice'
      isOpen={open}
      onClose={onClose}
      width='max-w-md'
    >
      <div className='flex flex-col gap-4'>
        <section className='flex flex-col gap-2'>
          <h3 className='text-[11px] font-semibold uppercase tracking-widest text-text-secondary'>
            Material
          </h3>
          <div className='grid grid-cols-5 gap-1'>
            {MATERIALS.map(m => (
              <MaterialButton
                key={m}
                material={m}
                active={preferences.material === m}
                onClick={() => setMaterial(m)}
              />
            ))}
          </div>
        </section>

        <section className='flex flex-col gap-2'>
          <h3 className='text-[11px] font-semibold uppercase tracking-widest text-text-secondary'>
            Custom Color
          </h3>
          <button
            type='button'
            onClick={() => setColorset(CUSTOM_COLORSET_KEY)}
            className={clsx(
              'flex items-center gap-3 rounded-md border p-2 text-left text-sm cursor-pointer text-text-primary',
              isCustomActive
                ? 'border-primary bg-primary/10'
                : 'border-border-light hover:bg-hover',
            )}
          >
            <span
              className='inline-flex size-7 shrink-0 items-center justify-center rounded border border-black/10 font-mono text-[10px] font-semibold text-white'
              style={{ backgroundColor: preferences.customColor }}
            >
              20
            </span>
            <span className='flex-1'>Use my color</span>
            {isCustomActive && (
              <span className='text-[10px] font-semibold uppercase tracking-widest text-primary'>
                Active
              </span>
            )}
          </button>
          <ColorPicker
            value={preferences.customColor}
            onChange={hex => {
              setCustomColor(hex)
              setColorset(CUSTOM_COLORSET_KEY)
            }}
            hint='Pick or paste a hex code (e.g. #ff0066)'
          />
        </section>

        <section className='flex flex-col gap-2'>
          <h3 className='text-[11px] font-semibold uppercase tracking-widest text-text-secondary'>
            Theme
          </h3>
          <label className='flex items-center gap-2 rounded-md border border-border-light bg-paper px-2 py-1'>
            <Search className='size-4 text-text-tertiary' aria-hidden='true' />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Search themes'
              className='w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-tertiary'
            />
          </label>

          {grouped.length === 0 ? (
            <p className='py-4 text-center text-sm text-text-secondary'>
              No themes match your search.
            </p>
          ) : (
            grouped.map(([category, items]) => (
              <div key={category} className='flex flex-col gap-1'>
                <h4 className='text-[10px] font-semibold uppercase tracking-widest text-text-tertiary'>
                  {category}
                </h4>
                <div className='grid grid-cols-2 gap-1'>
                  {items.map(preset => (
                    <ColorsetButton
                      key={preset.key}
                      preset={preset}
                      active={preferences.colorset === preset.key}
                      onClick={() => setColorset(preset.key)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </Modal>
  )
}

function MaterialButton({
  material,
  active,
  onClick,
}: Readonly<{
  material: DiceMaterial
  active: boolean
  onClick: () => void
}>) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={clsx(
        'cursor-pointer rounded-md border py-2 text-xs font-mono capitalize',
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border-light text-text-primary hover:bg-hover',
      )}
    >
      {material}
    </button>
  )
}

function ColorsetButton({
  preset,
  active,
  onClick,
}: Readonly<{
  preset: ColorsetPreset
  active: boolean
  onClick: () => void
}>) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={clsx(
        'flex items-center gap-2 rounded-md border p-2 text-left text-sm cursor-pointer text-text-primary',
        active
          ? 'border-primary bg-primary/10'
          : 'border-border-light hover:bg-hover',
      )}
    >
      <span
        className='inline-flex size-7 shrink-0 items-center justify-center rounded border border-black/10 font-mono text-[10px] font-semibold'
        style={{
          backgroundColor: preset.background,
          color: preset.foreground,
        }}
      >
        20
      </span>
      <span className='truncate'>{preset.name}</span>
    </button>
  )
}
