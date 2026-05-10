import {
  isExtraSmallSize,
  isSmallSize,
  isMediumSize,
  isLargeSize,
} from './utils'

describe('components/common/utils', () => {
  describe('isExtraSmallSize', () => {
    it('returns true for "xs"', () => {
      expect(isExtraSmallSize('xs')).toBe(true)
    })

    it('returns false for other sizes', () => {
      expect(isExtraSmallSize('sm')).toBe(false)
    })

    it('returns false when called with no argument', () => {
      expect(isExtraSmallSize()).toBe(false)
    })
  })

  describe('isSmallSize', () => {
    it('returns true for "sm"', () => {
      expect(isSmallSize('sm')).toBe(true)
    })

    it('returns false for other sizes', () => {
      expect(isSmallSize('md')).toBe(false)
    })

    it('returns false when called with no argument', () => {
      expect(isSmallSize()).toBe(false)
    })
  })

  describe('isMediumSize', () => {
    it('returns true for "md"', () => {
      expect(isMediumSize('md')).toBe(true)
    })

    it('returns false for other sizes', () => {
      expect(isMediumSize('lg')).toBe(false)
    })

    it('returns false when called with no argument', () => {
      expect(isMediumSize()).toBe(false)
    })
  })

  describe('isLargeSize', () => {
    it('returns true for "lg"', () => {
      expect(isLargeSize('lg')).toBe(true)
    })

    it('returns false for other sizes', () => {
      expect(isLargeSize('xs')).toBe(false)
    })

    it('returns false when called with no argument', () => {
      expect(isLargeSize()).toBe(false)
    })
  })
})
