'use client'

import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type SVGAttributes,
} from 'react'
import clsx from 'clsx'
import { Dices, InfoIcon } from 'lucide-react'
import { Button, Popover } from '@/components/common'
import {
  D4Icon,
  D6Icon,
  D8Icon,
  D10Icon,
  D12Icon,
  D20Icon,
} from '@/components/common/icons'
import {
  DIE_SIDES,
  type Advantage,
  type DieSides,
  type RollRequest,
} from '@/types/roll'

const DIE_ICON: Record<
  Exclude<DieSides, 100>,
  ComponentType<SVGAttributes<SVGElement>>
> = {
  4: D4Icon,
  6: D6Icon,
  8: D8Icon,
  10: D10Icon,
  12: D12Icon,
  20: D20Icon,
}

function DieIcon({ sides }: Readonly<{ sides: DieSides }>) {
  // d100 is rendered as a pair of d10s, since the asset library doesn't
  // ship a percentile-die icon and "two d10s" is the standard tabletop
  // representation.
  if (sides === 100) {
    return (
      <span className='inline-flex items-center -space-x-1'>
        <D10Icon className='size-5' />
        <D10Icon className='size-5' />
      </span>
    )
  }
  const Icon = DIE_ICON[sides]
  return <Icon className='size-5' />
}

type Props = {
  onRoll: (request: RollRequest) => void
  disabled?: boolean
}

const LONG_PRESS_MS = 450

type ModCounts = {
  plusOne: number
  minusOne: number
  plusFive: number
  minusFive: number
}

const EMPTY_MOD_COUNTS: ModCounts = {
  plusOne: 0,
  minusOne: 0,
  plusFive: 0,
  minusFive: 0,
}

const computeModifier = (c: ModCounts) =>
  (c.plusFive - c.minusFive) * 5 + c.plusOne - c.minusOne

export function DiceTray({ onRoll, disabled = false }: Readonly<Props>) {
  const [pools, setPools] = useState<ReadonlyMap<DieSides, number>>(new Map())
  const [modCounts, setModCounts] = useState<ModCounts>(EMPTY_MOD_COUNTS)
  const [advantage, setAdvantage] = useState<Advantage | undefined>()
  const [exploding, setExploding] = useState(false)
  const [menuFor, setMenuFor] = useState<DieSides | undefined>()

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )
  const longPressTriggered = useRef(false)

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = undefined
    }
  }

  // Close-on-outside-click / escape for the per-die menu. setTimeout(0) defers
  // the listener so the click that opened the menu doesn't immediately close it.
  useEffect(() => {
    if (menuFor === undefined) return
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('[data-die-menu]')) return
      setMenuFor(undefined)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuFor(undefined)
    }
    const armId = setTimeout(() => {
      document.addEventListener('click', onDocClick)
    }, 0)
    document.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(armId)
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuFor])

  const incrementDie = (sides: DieSides) =>
    setPools(prev => {
      const next = new Map(prev)
      next.set(sides, (next.get(sides) ?? 0) + 1)
      return next
    })

  const decrementDie = (sides: DieSides) =>
    setPools(prev => {
      const next = new Map(prev)
      const current = next.get(sides) ?? 0
      if (current <= 1) next.delete(sides)
      else next.set(sides, current - 1)
      return next
    })

  const clearDieType = (sides: DieSides) =>
    setPools(prev => {
      const next = new Map(prev)
      next.delete(sides)
      return next
    })

  // Pressing the inverse button cancels one tap from its sibling before adding
  // its own count, so the badges always show the *net* +1/+5 vs −1/−5 count
  // (at most one of each pair non-zero).
  const bumpMod = (key: keyof ModCounts, opposite: keyof ModCounts) =>
    setModCounts(prev =>
      prev[opposite] > 0
        ? { ...prev, [opposite]: prev[opposite] - 1 }
        : { ...prev, [key]: prev[key] + 1 },
    )

  const toggleAdvantage = (target: Advantage) =>
    setAdvantage(prev => (prev === target ? undefined : target))

  const clearAll = () => {
    setPools(new Map())
    setModCounts(EMPTY_MOD_COUNTS)
    setAdvantage(undefined)
    setExploding(false)
  }

  const poolEntries = [...pools.entries()].filter(([, count]) => count > 0)
  const isEmptyPools = poolEntries.length === 0
  const modifier = computeModifier(modCounts)
  const totalModTaps =
    modCounts.plusOne +
    modCounts.minusOne +
    modCounts.plusFive +
    modCounts.minusFive
  const isEmptyAll =
    isEmptyPools && totalModTaps === 0 && advantage === undefined && !exploding

  const handleRoll = () => {
    if (isEmptyPools || disabled) return
    onRoll({
      pools: poolEntries.map(([sides, count]) => ({ sides, count })),
      modifier,
      advantage,
      exploding,
    })
  }

  const openMenu = (sides: DieSides) => {
    if ((pools.get(sides) ?? 0) === 0) return
    setMenuFor(sides)
  }

  const handleDieClick = (sides: DieSides) => {
    if (longPressTriggered.current) {
      longPressTriggered.current = false
      return
    }
    incrementDie(sides)
  }

  const startLongPress = (sides: DieSides) => {
    longPressTriggered.current = false
    cancelLongPress()
    if ((pools.get(sides) ?? 0) === 0) return
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true
      openMenu(sides)
    }, LONG_PRESS_MS)
  }

  return (
    <div className='flex flex-col gap-2 border-t border-border-light bg-paper p-3'>
      <div className='grid grid-cols-7 gap-1'>
        {DIE_SIDES.map(sides => {
          const count = pools.get(sides) ?? 0
          const active = count > 0
          return (
            <div key={sides} className='relative'>
              <button
                type='button'
                onClick={e => {
                  // If a long-press just opened the menu, the synthetic click
                  // would otherwise propagate to the doc listener and close it
                  // again. Stop it from bubbling.
                  if (longPressTriggered.current) e.stopPropagation()
                  handleDieClick(sides)
                }}
                onContextMenu={e => {
                  e.preventDefault()
                  if (count > 0) openMenu(sides)
                }}
                onTouchStart={() => startLongPress(sides)}
                onTouchEnd={cancelLongPress}
                onTouchMove={cancelLongPress}
                onTouchCancel={cancelLongPress}
                disabled={disabled}
                className={clsx(
                  'relative flex w-full cursor-pointer items-center justify-center rounded-md border py-2 font-mono text-xs sm:text-sm select-none disabled:cursor-not-allowed disabled:opacity-50',
                  active
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border-light text-text-primary hover:bg-hover',
                )}
              >
                <span className='inline-flex items-center gap-1'>
                  <DieIcon sides={sides} />
                  <span className='hidden text-xs md:inline'>d{sides}</span>
                </span>
                {active && (
                  <span className='absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-white'>
                    {count}
                  </span>
                )}
              </button>

              {menuFor === sides && (
                <DieMenu
                  sides={sides}
                  count={count}
                  onRemove={() => {
                    decrementDie(sides)
                    setMenuFor(undefined)
                  }}
                  onClear={() => {
                    clearDieType(sides)
                    setMenuFor(undefined)
                  }}
                />
              )}
            </div>
          )
        })}
      </div>

      <div className='grid grid-cols-7 gap-1'>
        <ModButton
          onClick={() => bumpMod('minusFive', 'plusFive')}
          disabled={disabled}
          count={modCounts.minusFive}
        >
          −5
        </ModButton>
        <ModButton
          onClick={() => bumpMod('minusOne', 'plusOne')}
          disabled={disabled}
          count={modCounts.minusOne}
        >
          −1
        </ModButton>
        <ModButton
          onClick={() => bumpMod('plusOne', 'minusOne')}
          disabled={disabled}
          count={modCounts.plusOne}
        >
          +1
        </ModButton>
        <ModButton
          onClick={() => bumpMod('plusFive', 'minusFive')}
          disabled={disabled}
          count={modCounts.plusFive}
        >
          +5
        </ModButton>
        <ToggleButton
          active={advantage === 'adv'}
          activeClass='border-emerald-500 bg-emerald-500 text-white'
          onClick={() => toggleAdvantage('adv')}
          disabled={disabled}
        >
          ADV
        </ToggleButton>
        <ToggleButton
          active={advantage === 'dis'}
          activeClass='border-rose-500 bg-rose-500 text-white'
          onClick={() => toggleAdvantage('dis')}
          disabled={disabled}
        >
          DIS
        </ToggleButton>
        <ToggleButton
          active={exploding}
          activeClass='border-warning bg-warning text-white'
          onClick={() => setExploding(v => !v)}
          disabled={disabled}
        >
          EXP
        </ToggleButton>
      </div>

      <div className='flex items-center gap-2'>
        <Button
          intent='normal'
          variant='outline'
          size='lg'
          onClick={clearAll}
          disabled={disabled || isEmptyAll}
          className='text-sm sm:text-base'
        >
          Clear
        </Button>
        <Button
          intent='primary'
          size='lg'
          icon={Dices}
          onClick={handleRoll}
          disabled={disabled || isEmptyPools}
          className='flex-1 justify-center text-sm sm:text-base'
        >
          Roll
        </Button>
        <Popover
          asChild
          placement='top'
          content='Tap dice to add — long-press or right-click to remove.'
          contentClassName='max-w-[calc(100vw_-_16px)] z-30 rounded-lg bg-card px-3 py-2 text-xs text-text-primary shadow-md ring-1 ring-black/5'
        >
          <button
            type='button'
            aria-label='Dice tray help'
            className='flex shrink-0 cursor-pointer items-center justify-center text-info/80 hover:text-info'
          >
            <InfoIcon className='size-5' />
          </button>
        </Popover>
      </div>
    </div>
  )
}

function DieMenu({
  sides,
  count,
  onRemove,
  onClear,
}: Readonly<{
  sides: DieSides
  count: number
  onRemove: () => void
  onClear: () => void
}>) {
  return (
    <div
      data-die-menu
      role='menu'
      className='absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 min-w-32 overflow-hidden rounded-md border border-border-light bg-paper text-sm text-text-primary shadow-lg'
    >
      <button
        type='button'
        role='menuitem'
        onClick={onRemove}
        className='block w-full cursor-pointer px-3 py-2 text-left hover:bg-hover'
      >
        Remove 1 (×{count})
      </button>
      <button
        type='button'
        role='menuitem'
        onClick={onClear}
        className='block w-full cursor-pointer border-t border-border-light px-3 py-2 text-left hover:bg-hover'
      >
        Clear d{sides}
      </button>
    </div>
  )
}

function ModButton({
  children,
  onClick,
  disabled,
  count = 0,
}: Readonly<{
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  count?: number
}>) {
  const active = count > 0
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'relative cursor-pointer rounded-md border py-2 text-xs sm:text-sm font-mono disabled:cursor-not-allowed disabled:opacity-50',
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border-light text-text-primary hover:bg-hover',
      )}
    >
      {children}
      {active && (
        <span className='absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-white'>
          {count}
        </span>
      )}
    </button>
  )
}

function ToggleButton({
  children,
  onClick,
  disabled,
  active,
  activeClass,
}: Readonly<{
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  active: boolean
  activeClass: string
}>) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'cursor-pointer rounded-md border py-2 text-[10px] sm:text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50',
        active
          ? activeClass
          : 'border-border-light text-text-primary hover:bg-hover',
      )}
    >
      {children}
    </button>
  )
}
