'use client'

import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { Camera, Upload } from 'lucide-react'
import { Avatar } from '@/components/avatar'
import { Button, Input } from '@/components/common'
import { type UserProfile } from '@/hooks/use-user-profile'
import { compressImage } from '@/utils/compress-image'

type Props = {
  initial?: UserProfile
  onSave: (profile: UserProfile) => void
  onCancel?: () => void
  title?: string
  autoSave?: boolean
  /**
   * Drop the form's own card chrome (border/background/padding) and heading so
   * it can sit inside a host that already supplies them (e.g. a Modal).
   */
  bare?: boolean
}

export function ProfileForm({
  initial,
  onSave,
  onCancel,
  title,
  autoSave = false,
  bare = false,
}: Readonly<Props>) {
  const [name, setName] = useState(initial?.name ?? '')
  const [image, setImage] = useState<string | undefined>(initial?.image)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | undefined>()

  const onSaveRef = useRef(onSave)
  useEffect(() => {
    onSaveRef.current = onSave
  })

  const trimmedName = name.trim()

  useEffect(() => {
    if (!autoSave || !trimmedName) return
    onSaveRef.current({ name: trimmedName, image })
  }, [autoSave, trimmedName, image])

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

  const canSave = !!trimmedName && !busy

  return (
    <form
      className={clsx(
        'flex flex-col gap-4',
        !bare && 'rounded-lg border border-border-light bg-paper p-4',
      )}
      onSubmit={e => {
        e.preventDefault()
        if (autoSave || !canSave) return
        onSave({ name: trimmedName, image })
      }}
    >
      {!bare && (
        <h2 className='text-lg font-semibold text-text-primary'>
          {title ?? (initial ? 'Edit your profile' : 'Set up your profile')}
        </h2>
      )}

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
        <label
          htmlFor='avatar-input'
          className='flex w-fit cursor-pointer items-center gap-3'
        >
          <span className='group relative inline-block'>
            <Avatar
              name={trimmedName || 'anonymous'}
              image={image}
              className='size-16'
              alt='Avatar preview'
            />
            <span className='absolute inset-0 flex items-center justify-center rounded-full bg-black/45 opacity-0 transition-opacity group-hover:opacity-100'>
              <Camera className='size-5 text-white' aria-hidden='true' />
            </span>
          </span>
          <span className='inline-flex items-center gap-2 rounded-md border border-border-light px-3 py-1.5 text-sm font-medium text-text-primary hover:bg-hover'>
            <Upload className='size-4' aria-hidden='true' />
            {image ? 'Change photo' : 'Upload photo'}
          </span>
        </label>
        <input
          id='avatar-input'
          type='file'
          accept='image/*'
          onChange={handleFile}
          className='sr-only'
        />
        <p className='text-xs italic text-text-tertiary'>
          {image
            ? 'Using your uploaded picture.'
            : 'Skip to use a generated 8-bit avatar based on your name.'}
        </p>
        {error && <p className='text-xs italic text-danger'>{error}</p>}
      </div>

      {autoSave ? (
        <p className='text-xs italic text-text-tertiary'>
          Saved automatically as you type.
        </p>
      ) : (
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
      )}
    </form>
  )
}
