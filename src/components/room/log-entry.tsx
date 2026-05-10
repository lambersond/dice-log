import clsx from 'clsx'
import { Avatar } from '@/components/avatar'
import { formatResultExpression } from '@/utils/roll-dice'
import type { ChatMessage } from '@/types/chat'
import type { DiePool, RollResult } from '@/types/roll'

type Props = {
  roll: RollResult
  isMine?: boolean
}

export function LogEntry({ roll, isMine = false }: Readonly<Props>) {
  return (
    <div
      className={clsx(
        'rounded-lg border p-3',
        isMine
          ? 'border-primary/40 bg-primary/5'
          : 'border-border-light bg-paper',
      )}
    >
      <div className='flex items-center gap-2'>
        <Avatar
          name={roll.roller.name}
          image={roll.roller.image}
          seed={roll.roller.id}
          className='size-8'
        />
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm font-semibold text-text-primary'>
            {roll.roller.name ?? 'Anonymous'}
          </p>
          <p className='truncate font-mono text-xs text-text-secondary'>
            {formatResultExpression(roll)}
          </p>
        </div>
        <div className='font-mono text-2xl font-bold tabular-nums text-text-primary'>
          {roll.total}
        </div>
      </div>
      <div className='mt-2 flex flex-wrap items-center gap-x-3 gap-y-1'>
        {roll.pools.map((pool, i) => (
          <PoolDisplay key={`pool-${i}`} pool={pool} />
        ))}
        {roll.modifier !== 0 && (
          <span className='font-mono text-xs text-text-secondary'>
            {roll.modifier > 0 ? `+${roll.modifier}` : roll.modifier}
          </span>
        )}
      </div>
    </div>
  )
}

type ChatProps = {
  message: ChatMessage
  isMine?: boolean
}

export function ChatEntry({ message, isMine = false }: Readonly<ChatProps>) {
  return (
    <div
      className={clsx(
        'rounded-lg border p-3',
        isMine
          ? 'border-primary/40 bg-primary/5'
          : 'border-border-light bg-paper',
      )}
    >
      <div className='flex items-start gap-2'>
        <Avatar
          name={message.sender.name}
          image={message.sender.image}
          seed={message.sender.id}
          className='size-8'
        />
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm font-semibold text-text-primary'>
            {message.sender.name ?? 'Anonymous'}
          </p>
          <p className='whitespace-pre-wrap break-words text-sm text-text-primary'>
            {message.text}
          </p>
        </div>
      </div>
    </div>
  )
}

function dieValueClass(
  value: number,
  kept: number,
  hasAdvDis: boolean,
): string {
  if (value !== kept)
    return 'border-border-light text-text-tertiary line-through'
  if (hasAdvDis)
    return 'border-primary bg-primary/10 font-semibold text-primary'
  return 'border-border-dark font-semibold text-text-primary'
}

function PoolDisplay({ pool }: Readonly<{ pool: DiePool }>) {
  return (
    <div className='flex items-center gap-1'>
      <span className='font-mono text-[10px] uppercase text-text-secondary'>
        d{pool.sides}
      </span>
      <div className='flex flex-wrap gap-1'>
        {pool.rolls.map((dieRolls, i) => {
          const chain = pool.explosions?.[i] ?? []
          return (
            <div key={`die-${i}`} className='flex items-center gap-px'>
              {dieRolls.map((value, j) => (
                <span
                  key={`die-${i}-${j}`}
                  className={clsx(
                    'inline-flex size-6 items-center justify-center rounded border text-xs',
                    dieValueClass(value, pool.kept[i], dieRolls.length > 1),
                  )}
                >
                  {value}
                </span>
              ))}
              {chain.map((value, k) => (
                <span
                  key={`expl-${i}-${k}`}
                  className='inline-flex items-center text-warning'
                >
                  <span className='font-mono text-[10px]'>!</span>
                  <span className='inline-flex size-6 items-center justify-center rounded border border-warning bg-warning/10 text-xs font-semibold'>
                    {value}
                  </span>
                </span>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
