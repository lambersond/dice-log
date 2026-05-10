import { clamp01 } from './clamp01'

describe('utils/clamp01', () => {
  it('passes values inside [0, 1] through unchanged', () => {
    expect(clamp01(0)).toBe(0)
    expect(clamp01(0.5)).toBe(0.5)
    expect(clamp01(1)).toBe(1)
  })

  it('clamps values below 0 to 0', () => {
    expect(clamp01(-0.1)).toBe(0)
    expect(clamp01(-100)).toBe(0)
    expect(clamp01(Number.NEGATIVE_INFINITY)).toBe(0)
  })

  it('clamps values above 1 to 1', () => {
    expect(clamp01(1.0001)).toBe(1)
    expect(clamp01(42)).toBe(1)
    expect(clamp01(Number.POSITIVE_INFINITY)).toBe(1)
  })

  it('returns NaN when given NaN', () => {
    expect(clamp01(Number.NaN)).toBeNaN()
  })
})
