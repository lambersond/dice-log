/* eslint-disable sonarjs/pseudo-random */
'use client'

import {
  useEffect,
  useState,
  type CSSProperties,
  type ComponentType,
  type SVGAttributes,
} from 'react'
import {
  D4Icon,
  D6Icon,
  D8Icon,
  D12Icon,
  D20Icon,
} from '@/components/common/icons'

type DieIcon = ComponentType<SVGAttributes<SVGElement>>

const ROLL_COMPOSITION: readonly DieIcon[] = [
  D20Icon,
  D20Icon,
  D8Icon,
  D8Icon,
  D8Icon,
  D6Icon,
  D6Icon,
  D12Icon,
  D4Icon,
  D4Icon,
]

type Die = {
  id: number
  Icon: DieIcon
  startX: string
  startY: string
  endX: string
  endY: string
  size: number
  duration: number
  delay: number
  rotation: number
  opacity: number
}

const rand = (min: number, max: number) => Math.random() * (max - min) + min

const pick = <T,>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)]

function spawnDie(id: number, Icon: DieIcon): Die {
  const side = pick(['top', 'bottom', 'left', 'right'] as const)
  let startX = '0vw'
  let startY = '0vh'
  let endX = '0vw'
  let endY = '0vh'

  switch (side) {
    case 'top': {
      startX = `${rand(0, 100)}vw`
      startY = '-15vh'
      endX = `${rand(0, 100)}vw`
      endY = '115vh'
      break
    }
    case 'bottom': {
      startX = `${rand(0, 100)}vw`
      startY = '115vh'
      endX = `${rand(0, 100)}vw`
      endY = '-15vh'
      break
    }
    case 'left': {
      startX = '-15vw'
      startY = `${rand(0, 100)}vh`
      endX = '115vw'
      endY = `${rand(0, 100)}vh`
      break
    }
    case 'right': {
      startX = '115vw'
      startY = `${rand(0, 100)}vh`
      endX = '-15vw'
      endY = `${rand(0, 100)}vh`
      break
    }
  }

  return {
    id,
    Icon,
    startX,
    startY,
    endX,
    endY,
    size: rand(36, 72),
    duration: rand(10, 20),
    delay: rand(0, 8),
    rotation: rand(180, 720) * (Math.random() < 0.5 ? -1 : 1),
    opacity: rand(0.08, 0.18),
  }
}

export function DiceBackground() {
  const [dice, setDice] = useState<readonly Die[]>([])

  useEffect(() => {
    setDice(ROLL_COMPOSITION.map((Icon, i) => spawnDie(i, Icon)))
  }, [])

  return (
    <>
      <CenterFlare />
      <div
        data-dice-bg
        aria-hidden='true'
        className='pointer-events-none fixed inset-0 -z-10 overflow-hidden text-zinc-500'
      >
        {dice.map(die => {
          const Icon = die.Icon
          const style: CSSProperties & Record<string, string | number> = {
            '--dice-start-x': die.startX,
            '--dice-start-y': die.startY,
            '--dice-end-x': die.endX,
            '--dice-end-y': die.endY,
            '--dice-rot': `${die.rotation}deg`,
            opacity: die.opacity,
            animation: `dice-roll ${die.duration}s ${die.delay}s linear infinite`,
          }
          return (
            <span key={die.id} className='absolute top-0 left-0' style={style}>
              <Icon width={die.size} height={die.size} />
            </span>
          )
        })}
      </div>
    </>
  )
}

function CenterFlare() {
  return (
    <div
      data-home-flare
      aria-hidden='true'
      className='pointer-events-none fixed inset-0 -z-10 flex items-center justify-center'
    >
      <div
        className='h-[70vh] w-[120vw] max-w-[1100px] rotate-[-12deg]'
        style={{
          background:
            'radial-gradient(ellipse 55% 40% at 50% 50%, var(--color-primary) 0%, color-mix(in oklch, var(--color-primary), transparent 80%) 35%, transparent 70%)',
          opacity: 0.18,
          filter: 'blur(60px)',
        }}
      />
    </div>
  )
}
