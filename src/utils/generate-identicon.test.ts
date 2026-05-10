import { generateIdenticon } from './generate-identicon'

const decode = (dataUrl: string): string => {
  const prefix = 'data:image/svg+xml;base64,'
  expect(dataUrl.startsWith(prefix)).toBe(true)
  const b64 = dataUrl.slice(prefix.length)
  return globalThis.atob
    ? globalThis.atob(b64)
    : Buffer.from(b64, 'base64').toString('binary')
}

describe('utils/generateIdenticon', () => {
  it('returns a base64 SVG data URL', () => {
    const url = generateIdenticon('alice')
    expect(url).toMatch(/^data:image\/svg\+xml;base64,/)
    const svg = decode(url)
    expect(svg).toContain('<svg ')
    expect(svg).toContain('viewBox="0 0 100 100"')
  })

  it('is deterministic for the same seed', () => {
    expect(generateIdenticon('alice')).toBe(generateIdenticon('alice'))
  })

  it('produces different output for different seeds', () => {
    expect(generateIdenticon('alice')).not.toBe(generateIdenticon('bob'))
  })

  it('renders a left-right symmetric pattern', () => {
    const svg = decode(generateIdenticon('symmetry-check'))
    // Each rect occupies a 20-unit cell at x ∈ {0, 20, 40, 60, 80}; pull
    // out (x, y) pairs and verify the pattern mirrors across x=50.
    const rects = [...svg.matchAll(/x="(\d+)" y="(\d+)" width="20"/g)].map(
      m => [Number(m[1]), Number(m[2])] as const,
    )
    // The first rect (always present) is the background at (0,0). Skip it
    // by only looking at coordinates inside the grid.
    const grid = rects.filter(([x]) => x % 20 === 0)
    const set = new Set(grid.map(([x, y]) => `${x},${y}`))
    for (const [x, y] of grid) {
      const mirroredX = 80 - x
      expect(set.has(`${mirroredX},${y}`)).toBe(true)
    }
  })

  it('treats empty / whitespace seeds as "anonymous"', () => {
    expect(generateIdenticon('')).toBe(generateIdenticon('anonymous'))
    expect(generateIdenticon('   ')).toBe(generateIdenticon('anonymous'))
  })

  it('honours the size param in the SVG attributes', () => {
    const svg = decode(generateIdenticon('alice', 64))
    expect(svg).toContain('width="64"')
    expect(svg).toContain('height="64"')
  })
})
