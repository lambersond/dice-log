import { handleOnClick, isGroupOption, isGroupType } from './utils'

describe('components/common/menu/utils', () => {
  describe('handleOnClick', () => {
    it('stops propagation and forwards the event to the inner handler', () => {
      const inner = jest.fn()
      const stopPropagation = jest.fn()
      const event = {
        stopPropagation,
      } as unknown as React.MouseEvent<HTMLButtonElement>

      handleOnClick(inner)(event)

      expect(stopPropagation).toHaveBeenCalledTimes(1)
      expect(inner).toHaveBeenCalledWith(event)
    })
  })

  describe('isGroupType', () => {
    it('returns true when the first item has nested options', () => {
      expect(
        isGroupType([
          { key: 'g', options: [{ label: 'a', onClick: jest.fn() }] },
        ]),
      ).toBe(true)
    })

    it('returns false for a flat option array', () => {
      expect(isGroupType([{ label: 'a', onClick: jest.fn() }])).toBe(false)
    })

    it('returns false for an empty array', () => {
      expect(isGroupType([])).toBe(false)
    })
  })

  describe('isGroupOption', () => {
    it('returns true for an object with an options array', () => {
      expect(isGroupOption({ key: 'g', options: [] } as any)).toBe(true)
    })

    it('returns false for a flat option', () => {
      expect(isGroupOption({ label: 'a', onClick: jest.fn() } as any)).toBe(
        false,
      )
    })
  })
})
