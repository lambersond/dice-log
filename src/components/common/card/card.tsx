import clsx from 'clsx'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { CardProps } from './types'

export function Card({
  icon: Icon,
  title,
  description,
  href,
  viewLabel,
  action,
  children,
  className,
}: Readonly<CardProps>) {
  const clickable = !!href

  return (
    <article
      className={clsx(
        'group relative flex flex-col gap-4 rounded-xl bg-card p-5 shadow-card',
        clickable && 'transition-shadow hover:shadow-card-hover',
        className,
      )}
    >
      <header className='flex items-start justify-between gap-3'>
        <div className='flex items-center gap-2 min-w-0'>
          <Icon
            className='size-5 shrink-0 text-text-secondary'
            aria-hidden='true'
          />
          <h3 className='text-lg font-semibold text-text-primary truncate'>
            {clickable ? (
              <Link
                href={href}
                className={clsx(
                  'before:absolute before:inset-0 before:content-[""]',
                  'focus:outline-none focus-visible:underline',
                  'group-hover:underline',
                )}
              >
                {title}
              </Link>
            ) : (
              title
            )}
          </h3>
        </div>
        {action && <div className='relative z-1 shrink-0'>{action}</div>}
      </header>

      {description && (
        <p className='-mt-2 text-sm text-text-secondary'>{description}</p>
      )}

      {children}

      {clickable && viewLabel && (
        <span
          className='pointer-events-none mt-auto self-end inline-flex
            items-center gap-1 text-xs font-medium text-primary opacity-0
            transition-opacity group-hover:opacity-100
            group-focus-visible:opacity-100'
          aria-hidden='true'
        >
          {viewLabel}
          <ArrowRight className='size-3.5' />
        </span>
      )}
    </article>
  )
}
