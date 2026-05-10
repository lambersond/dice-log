'use client'

import { useMemo } from 'react'
import clsx from 'clsx'
import { generateIdenticon } from '@/utils/generate-identicon'

type Props = {
  /** Display name; also used as the seed when no image is provided. */
  name?: string
  /** Optional uploaded image (data URL). */
  image?: string
  /** Stable seed for the identicon when name is empty (e.g., user_id). */
  seed?: string
  /** Tailwind size class, defaults to size-10. */
  className?: string
  alt?: string
}

export function Avatar({ name, image, seed, className, alt }: Readonly<Props>) {
  const identiconSeed = (seed ?? name ?? '').trim() || 'anonymous'
  const fallback = useMemo(
    () => generateIdenticon(identiconSeed),
    [identiconSeed],
  )
  const src = image || fallback

  return (
    // eslint-disable-next-line @next/next/no-img-element -- avatar is a data URL
    <img
      src={src}
      alt={alt ?? name ?? ''}
      className={clsx(
        'shrink-0 rounded-full object-cover bg-card',
        className ?? 'size-10',
      )}
    />
  )
}
