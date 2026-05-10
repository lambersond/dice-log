import { copyTextToClipboard } from './copy-text-to-clipboard'

describe('utils/copyTextToClipboard', () => {
  const originalClipboard = navigator.clipboard

  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: originalClipboard,
    })
  })

  const stubClipboard = (writeText: jest.Mock) => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
  }

  it('writes the text and returns true on success', async () => {
    const writeText = jest.fn(() => Promise.resolve())
    stubClipboard(writeText)

    await expect(copyTextToClipboard('hello')).resolves.toBe(true)
    expect(writeText).toHaveBeenCalledWith('hello')
  })

  it('returns false when writeText rejects', async () => {
    const writeText = jest.fn().mockRejectedValue(new Error('denied'))
    stubClipboard(writeText)

    await expect(copyTextToClipboard('nope')).resolves.toBe(false)
  })

  it('returns false when the clipboard API is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    })

    await expect(copyTextToClipboard('x')).resolves.toBe(false)
  })
})
