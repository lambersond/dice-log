/* eslint-disable sonarjs/pseudo-random -- dice rolls are not a security primitive */

import type {
  Advantage,
  DiePool,
  DieSides,
  RollRequest,
  RollResult,
  RollerInfo,
} from '@/types/roll'

const rollDie = (sides: number) => Math.floor(Math.random() * sides) + 1

/**
 * Hard cap on explosions per die so a degenerate Math.random sequence can't
 * spin forever. 50 explosions on a d4 is already astronomically improbable
 * (~1 in 4^50) and rolls past this just stop.
 */
const EXPLOSION_CAP = 50

function rollExplosionChain(sides: DieSides, seedValue: number): number[] {
  const chain: number[] = []
  let last = seedValue
  while (last === sides && chain.length < EXPLOSION_CAP) {
    const next = rollDie(sides)
    chain.push(next)
    last = next
  }
  return chain
}

function rollPool(
  sides: DieSides,
  count: number,
  advantage: Advantage | undefined,
  exploding: boolean,
): DiePool {
  // Adv/dis only applies to d20s; everything else rolls once.
  const useAdvDis = advantage !== undefined && sides === 20

  const rolls: number[][] = []
  const kept: number[] = []
  const explosions: number[][] = []
  let anyExplosion = false

  for (let i = 0; i < count; i += 1) {
    let keptValue: number
    if (useAdvDis) {
      const a = rollDie(20)
      const b = rollDie(20)
      rolls.push([a, b])
      keptValue = advantage === 'adv' ? Math.max(a, b) : Math.min(a, b)
    } else {
      const v = rollDie(sides)
      rolls.push([v])
      keptValue = v
    }
    kept.push(keptValue)

    const chain = exploding ? rollExplosionChain(sides, keptValue) : []
    explosions.push(chain)
    if (chain.length > 0) anyExplosion = true
  }

  const pool: DiePool = { sides, count, rolls, kept }
  if (anyExplosion) pool.explosions = explosions
  return pool
}

export function executeRoll(
  request: RollRequest,
  roller: RollerInfo,
  now: number = Date.now(),
  id: string = crypto.randomUUID(),
): RollResult {
  const pools = request.pools
    .filter(p => p.count > 0)
    .map(p =>
      rollPool(p.sides, p.count, request.advantage, request.exploding ?? false),
    )

  const diceTotal = pools.reduce(
    (sum, pool) =>
      sum +
      pool.kept.reduce((s, v) => s + v, 0) +
      (pool.explosions ?? []).reduce(
        (s, chain) => s + chain.reduce((c, v) => c + v, 0),
        0,
      ),
    0,
  )

  return {
    id,
    at: now,
    roller,
    pools,
    modifier: request.modifier,
    advantage: request.advantage,
    total: diceTotal + request.modifier,
  }
}

export function formatRollExpression(request: RollRequest): string {
  const explSuffix = request.exploding ? '!' : ''
  const parts = request.pools
    .filter(p => p.count > 0)
    .map(p => `${p.count}d${p.sides}${explSuffix}`)

  if (request.modifier > 0) parts.push(`+${request.modifier}`)
  else if (request.modifier < 0) parts.push(`${request.modifier}`)

  let expression = parts
    .join(' + ')
    .replaceAll(' + +', ' + ')
    .replaceAll(' + -', ' − ')
  if (!expression) expression = '—'

  if (request.advantage === 'adv') expression += ' (adv)'
  else if (request.advantage === 'dis') expression += ' (dis)'

  return expression
}

export function formatResultExpression(result: RollResult): string {
  return formatRollExpression({
    pools: result.pools.map(p => ({ sides: p.sides, count: p.count })),
    modifier: result.modifier,
    advantage: result.advantage,
    exploding: result.pools.some(p =>
      (p.explosions ?? []).some(c => c.length > 0),
    ),
  })
}

/**
 * Builds dice-box-threejs predetermined notation. The library parses the first
 * `@` only (everything after is the predetermined values list), so all pools
 * must share a single trailing `@<csv>` — one `@` per pool would silently drop
 * every pool except the first.
 *
 * Modifier is intentionally omitted — total is computed from the deterministic
 * result, not from the canvas. Explosion follow-up dice are appended so the
 * canvas spawns an extra die for each explosion.
 */
export function toDiceBoxNotation(result: RollResult): string {
  const notationParts: string[] = []
  const allValues: number[] = []
  for (const pool of result.pools) {
    const initial = pool.rolls.flat()
    const explosionsFlat = (pool.explosions ?? []).flat()
    const totalDice = initial.length + explosionsFlat.length
    notationParts.push(`${totalDice}d${pool.sides}`)
    allValues.push(...initial, ...explosionsFlat)
  }
  const dice = notationParts.join('+')
  return allValues.length > 0 ? `${dice}@${allValues.join(',')}` : dice
}
