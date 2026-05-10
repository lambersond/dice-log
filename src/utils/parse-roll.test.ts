import { parseRollExpression } from './parse-roll'

const ok = (input: string) => {
  const r = parseRollExpression(input)
  if (!r.ok) throw new Error(`expected ok for "${input}", got: ${r.error}`)
  return r.request
}

describe('parseRollExpression', () => {
  it('parses a single-pool expression with default count', () => {
    expect(ok('d20')).toEqual({
      pools: [{ sides: 20, count: 1 }],
      modifier: 0,
      advantage: undefined,
      exploding: false,
    })
  })

  it('parses count + sides', () => {
    const r = ok('2d6')
    expect(r.pools).toEqual([{ sides: 6, count: 2 }])
    expect(r.modifier).toBe(0)
  })

  it('parses positive modifiers with whitespace', () => {
    const r = ok('d20 + 5')
    expect(r.pools).toEqual([{ sides: 20, count: 1 }])
    expect(r.modifier).toBe(5)
  })

  it('parses negative modifiers without whitespace', () => {
    const r = ok('2d6-2')
    expect(r.modifier).toBe(-2)
  })

  it('sums multiple modifiers', () => {
    const r = ok('d20 + 3 + 1 - 2')
    expect(r.modifier).toBe(2)
  })

  it('combines multiple pools sorted by sides', () => {
    const r = ok('2d8 + 1d6 + 3')
    expect(r.pools).toEqual([
      { sides: 6, count: 1 },
      { sides: 8, count: 2 },
    ])
    expect(r.modifier).toBe(3)
  })

  it('merges pools of the same die into one', () => {
    const r = ok('d6 + 2d6')
    expect(r.pools).toEqual([{ sides: 6, count: 3 }])
  })

  it('recognizes adv keyword', () => {
    expect(ok('d20 adv').advantage).toBe('adv')
    expect(ok('d20 advantage').advantage).toBe('adv')
  })

  it('recognizes dis keyword', () => {
    expect(ok('d20 dis').advantage).toBe('dis')
    expect(ok('d20 disadvantage').advantage).toBe('dis')
  })

  it('lets the later flag win when both adv and dis appear', () => {
    expect(ok('d20 dis adv').advantage).toBe('adv')
    expect(ok('d20 adv dis').advantage).toBe('dis')
  })

  it('recognizes exp keyword and trailing bang', () => {
    expect(ok('2d6 exp').exploding).toBe(true)
    expect(ok('2d6 explode').exploding).toBe(true)
    expect(ok('2d6 exploding').exploding).toBe(true)
    expect(ok('2d6!').exploding).toBe(true)
  })

  it('combines flags with pools and modifiers', () => {
    const r = ok('1d20 + 2d6 + 5 adv exp')
    expect(r).toEqual({
      pools: [
        { sides: 6, count: 2 },
        { sides: 20, count: 1 },
      ],
      modifier: 5,
      advantage: 'adv',
      exploding: true,
    })
  })

  it('is case-insensitive', () => {
    const r = ok('1D20+5 ADV EXP')
    expect(r.pools).toEqual([{ sides: 20, count: 1 }])
    expect(r.modifier).toBe(5)
    expect(r.advantage).toBe('adv')
    expect(r.exploding).toBe(true)
  })

  it('rejects empty input', () => {
    const r = parseRollExpression('   ')
    expect(r.ok).toBe(false)
  })

  it('rejects an expression with no dice', () => {
    const r = parseRollExpression('+5')
    expect(r.ok).toBe(false)
  })

  it('rejects unsupported die sizes', () => {
    const r = parseRollExpression('1d7')
    expect(r).toEqual({ ok: false, error: 'Unsupported die: d7' })
  })

  it('accepts d100', () => {
    const r = ok('d100')
    expect(r.pools).toEqual([{ sides: 100, count: 1 }])
  })
})
