import {
  executeRoll,
  formatResultExpression,
  formatRollExpression,
  toDiceBoxNotation,
} from './roll-dice'
import type { RollerInfo } from '@/types/roll'

const ROLLER: RollerInfo = { id: 'u1', name: 'Tester' }

describe('utils/roll-dice', () => {
  let randomSpy: jest.SpyInstance

  afterEach(() => {
    randomSpy?.mockRestore()
  })

  const stubRandom = (...sequence: number[]) => {
    let i = 0
    randomSpy = jest
      .spyOn(Math, 'random')
      .mockImplementation(() => sequence[i++ % sequence.length])
  }

  describe('executeRoll', () => {
    it('rolls each die once with no advantage', () => {
      // Math.random() ∈ [0,1); Math.floor(r * sides) + 1 → for sides=20, r=0.55 → 12
      stubRandom(0.55) // d20 → 12
      const result = executeRoll(
        {
          pools: [{ sides: 20, count: 1 }],
          modifier: 0,
        },
        ROLLER,
        100,
        'roll-1',
      )
      expect(result).toEqual({
        id: 'roll-1',
        at: 100,
        roller: ROLLER,
        pools: [{ sides: 20, count: 1, rolls: [[12]], kept: [12] }],
        modifier: 0,
        advantage: undefined,
        total: 12,
      })
    })

    it('adds the modifier to the total', () => {
      stubRandom(0.55) // 12
      const result = executeRoll(
        { pools: [{ sides: 20, count: 1 }], modifier: 5 },
        ROLLER,
      )
      expect(result.total).toBe(17)
    })

    it('subtracts a negative modifier', () => {
      stubRandom(0.55) // 12
      const result = executeRoll(
        { pools: [{ sides: 20, count: 1 }], modifier: -3 },
        ROLLER,
      )
      expect(result.total).toBe(9)
    })

    it('rolls each d20 twice and keeps the higher with advantage', () => {
      // Two d20s, each rolled twice → 4 random values consumed
      stubRandom(0.5, 0.95, 0.1, 0.6) // 11, 20, 3, 13 — kept: 20, 13
      const result = executeRoll(
        {
          pools: [{ sides: 20, count: 2 }],
          modifier: 0,
          advantage: 'adv',
        },
        ROLLER,
      )
      expect(result.pools[0].rolls).toEqual([
        [11, 20],
        [3, 13],
      ])
      expect(result.pools[0].kept).toEqual([20, 13])
      expect(result.total).toBe(33)
    })

    it('keeps the lower of each pair with disadvantage', () => {
      stubRandom(0.5, 0.95) // 11, 20 — kept: 11
      const result = executeRoll(
        {
          pools: [{ sides: 20, count: 1 }],
          modifier: 0,
          advantage: 'dis',
        },
        ROLLER,
      )
      expect(result.pools[0].kept).toEqual([11])
      expect(result.total).toBe(11)
    })

    it('does not apply advantage to non-d20 dice', () => {
      stubRandom(0.5, 0.95) // d6 only consumes one
      const result = executeRoll(
        {
          pools: [{ sides: 6, count: 1 }],
          modifier: 0,
          advantage: 'adv',
        },
        ROLLER,
      )
      expect(result.pools[0].rolls).toEqual([[4]])
    })

    it('drops empty pools', () => {
      stubRandom(0)
      const result = executeRoll(
        {
          pools: [
            { sides: 20, count: 0 },
            { sides: 6, count: 2 },
          ],
          modifier: 0,
        },
        ROLLER,
      )
      expect(result.pools).toHaveLength(1)
      expect(result.pools[0].sides).toBe(6)
    })
  })

  describe('formatRollExpression', () => {
    it('joins pools with + and shows the modifier', () => {
      expect(
        formatRollExpression({
          pools: [
            { sides: 20, count: 1 },
            { sides: 6, count: 3 },
          ],
          modifier: 5,
        }),
      ).toBe('1d20 + 3d6 + 5')
    })

    it('renders a negative modifier with a minus sign', () => {
      expect(
        formatRollExpression({
          pools: [{ sides: 20, count: 1 }],
          modifier: -3,
        }),
      ).toBe('1d20 − 3')
    })

    it('appends an advantage tag', () => {
      expect(
        formatRollExpression({
          pools: [{ sides: 20, count: 1 }],
          modifier: 0,
          advantage: 'adv',
        }),
      ).toBe('1d20 (adv)')
    })

    it('returns a placeholder for an empty request', () => {
      expect(formatRollExpression({ pools: [], modifier: 0 })).toBe('—')
    })
  })

  describe('formatResultExpression', () => {
    it('mirrors the request expression', () => {
      stubRandom(0.5, 0.5, 0.5, 0.5)
      const result = executeRoll(
        {
          pools: [
            { sides: 20, count: 1 },
            { sides: 6, count: 3 },
          ],
          modifier: 5,
          advantage: 'adv',
        },
        ROLLER,
      )
      expect(formatResultExpression(result)).toBe('1d20 + 3d6 + 5 (adv)')
    })
  })

  describe('exploding dice', () => {
    it('explodes on max and includes the chain in the total', () => {
      // d6: r=0.99 → 6 (max, explodes), r=0.01 → 1 (no further explode)
      stubRandom(0.99, 0.01)
      const result = executeRoll(
        {
          pools: [{ sides: 6, count: 1 }],
          modifier: 0,
          exploding: true,
        },
        ROLLER,
      )
      expect(result.pools[0].kept).toEqual([6])
      expect(result.pools[0].explosions).toEqual([[1]])
      expect(result.total).toBe(7)
    })

    it('chains multiple explosions while max keeps coming up', () => {
      // d6: 6, 6, 6, 4 — three explosions then stops
      stubRandom(0.99, 0.99, 0.99, 0.55)
      const result = executeRoll(
        {
          pools: [{ sides: 6, count: 1 }],
          modifier: 0,
          exploding: true,
        },
        ROLLER,
      )
      expect(result.pools[0].kept).toEqual([6])
      expect(result.pools[0].explosions).toEqual([[6, 6, 4]])
      expect(result.total).toBe(22)
    })

    it('does not explode when the flag is off', () => {
      stubRandom(0.99) // d6 → 6, no chain
      const result = executeRoll(
        { pools: [{ sides: 6, count: 1 }], modifier: 0 },
        ROLLER,
      )
      expect(result.pools[0].kept).toEqual([6])
      expect(result.pools[0].explosions).toBeUndefined()
      expect(result.total).toBe(6)
    })

    it('omits the explosions field when no die explodes', () => {
      stubRandom(0.5) // d20 → 11 (not max)
      const result = executeRoll(
        {
          pools: [{ sides: 20, count: 1 }],
          modifier: 0,
          exploding: true,
        },
        ROLLER,
      )
      expect(result.pools[0].explosions).toBeUndefined()
    })

    it('only the kept die explodes when adv/dis is also active', () => {
      // d20 with adv: roll1=11, roll2=20 (max, kept) → explodes once, then 5
      stubRandom(0.5, 0.99, 0.2)
      const result = executeRoll(
        {
          pools: [{ sides: 20, count: 1 }],
          modifier: 0,
          advantage: 'adv',
          exploding: true,
        },
        ROLLER,
      )
      expect(result.pools[0].rolls).toEqual([[11, 20]])
      expect(result.pools[0].kept).toEqual([20])
      expect(result.pools[0].explosions).toEqual([[5]])
      expect(result.total).toBe(25)
    })

    it('formatResultExpression appends ! when any pool exploded', () => {
      stubRandom(0.99, 0.01)
      const result = executeRoll(
        {
          pools: [{ sides: 6, count: 2 }],
          modifier: 0,
          exploding: true,
        },
        ROLLER,
      )
      expect(formatResultExpression(result)).toBe('2d6!')
    })

    it('toDiceBoxNotation includes explosion follow-ups so the canvas spawns them', () => {
      stubRandom(0.99, 0.5) // d6 → 6 (max), then 4
      const result = executeRoll(
        {
          pools: [{ sides: 6, count: 1 }],
          modifier: 0,
          exploding: true,
        },
        ROLLER,
      )
      // 1 initial + 1 explosion = 2 physical dice
      expect(toDiceBoxNotation(result)).toBe('2d6@6,4')
    })
  })

  describe('formatRollExpression with !', () => {
    it('appends ! to each pool when exploding is set', () => {
      expect(
        formatRollExpression({
          pools: [
            { sides: 6, count: 2 },
            { sides: 8, count: 1 },
          ],
          modifier: 3,
          exploding: true,
        }),
      ).toBe('2d6! + 1d8! + 3')
    })
  })

  describe('toDiceBoxNotation', () => {
    it('flattens adv/dis pairs into the predetermined notation', () => {
      stubRandom(0.5, 0.95, 0.1, 0.6)
      const result = executeRoll(
        {
          pools: [{ sides: 20, count: 2 }],
          modifier: 99, // modifier intentionally omitted from notation
          advantage: 'adv',
        },
        ROLLER,
      )
      expect(toDiceBoxNotation(result)).toBe('4d20@11,20,3,13')
    })

    it('joins multiple pools under a single trailing @ clause', () => {
      // The dice-box parser splits on `@` once, so multiple `@` clauses
      // silently drop every pool past the first. All values must land in
      // one trailing list.
      stubRandom(0.5, 0.5, 0.5, 0.5)
      const result = executeRoll(
        {
          pools: [
            { sides: 6, count: 2 },
            { sides: 8, count: 2 },
          ],
          modifier: 0,
        },
        ROLLER,
      )
      expect(toDiceBoxNotation(result)).toBe('2d6+2d8@4,4,5,5')
    })

    it('returns dice notation alone when no values were rolled', () => {
      const result = executeRoll(
        { pools: [{ sides: 20, count: 0 }], modifier: 0 },
        ROLLER,
      )
      expect(toDiceBoxNotation(result)).toBe('')
    })
  })
})
