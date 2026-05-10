'use client'

import { useState } from 'react'
import { Avatar } from '@/components/avatar'
import { Button, Input } from '@/components/common'
import { type UserProfile } from '@/hooks/use-user-profile'
import { compressImage } from '@/utils/compress-image'

type Props = {
  initial?: UserProfile
  onSave: (profile: UserProfile) => void
  onCancel?: () => void
  /** Optional override for the form heading. */
  title?: string
}

export function ProfileForm({
  initial,
  onSave,
  onCancel,
  title,
}: Readonly<Props>) {
  const [name, setName] = useState(initial?.name ?? '')
  const [image, setImage] = useState<string | undefined>(initial?.image)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | undefined>()

  const handleFile: React.ChangeEventHandler<HTMLInputElement> = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setError(undefined)
    try {
      const compressed = await compressImage(file)
      setImage(compressed)
    } catch (error_) {
      setError(
        error_ instanceof Error ? error_.message : 'Failed to read image',
      )
    } finally {
      setBusy(false)
    }
  }

  const trimmedName = name.trim()
  const canSave = !!trimmedName && !busy

  return (
    <form
      className='flex flex-col gap-4 rounded-lg border border-border-light bg-paper p-4'
      onSubmit={e => {
        e.preventDefault()
        if (!canSave) return
        onSave({ name: trimmedName, image })
      }}
    >
      <h2 className='text-lg font-semibold text-text-primary'>
        {title ?? (initial ? 'Edit your profile' : 'Set up your profile')}
      </h2>

      <Input
        label='Display name'
        name='name'
        value={name}
        onChange={e => setName(e.target.value)}
        required
        hideError
        placeholder='Aragorn'
      />

      <div className='flex flex-col gap-2'>
        <label
          htmlFor='avatar-input'
          className='text-[11px] font-semibold uppercase tracking-widest text-text-secondary'
        >
          Avatar (optional)
        </label>
        <div className='flex items-center gap-3'>
          <Avatar
            name={trimmedName || 'anonymous'}
            image={image}
            className='size-16'
            alt='Avatar preview'
          />
          <input
            id='avatar-input'
            type='file'
            accept='image/*'
            onChange={handleFile}
            className='cursor-pointer text-sm text-text-secondary'
          />
        </div>
        <p className='text-xs italic text-text-tertiary'>
          {image
            ? 'Using your uploaded picture.'
            : 'Skip to use a generated 8-bit avatar based on your name.'}
        </p>
        {error && <p className='text-xs italic text-danger'>{error}</p>}
      </div>

      <div className='flex justify-end gap-2'>
        {onCancel && (
          <Button intent='normal' variant='ghost' onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type='submit' disabled={!canSave}>
          {busy ? 'Compressing…' : 'Save'}
        </Button>
      </div>
    </form>
  )
}
