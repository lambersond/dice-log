import { SessionWrapper } from './session-wrapper'
import { render } from '@/utils/test-utils'
import type { ReactNode } from 'react'

jest.mock('@/providers/ably', () => ({
  AblyProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

// 3d-dice-react is an ESM-only package whose dependency chain pulls in
// three.js/cannon-es — jest can't resolve it under jsdom, so register a
// virtual stub of the bits session-wrapper wires up.
jest.mock(
  '@lambersond/3d-dice-react',
  () => ({
    DicePreferencesProvider: ({ children }: { children: ReactNode }) => (
      <>{children}</>
    ),
    DiceRendererProvider: ({ children }: { children: ReactNode }) => (
      <>{children}</>
    ),
    localStoragePreferences: () => ({ get: () => {}, set: () => {} }),
  }),
  { virtual: true },
)

describe('components/session-wrapper', () => {
  it('should render children', () => {
    const { getByText } = render(
      <SessionWrapper>
        <div>Restricted Page</div>
      </SessionWrapper>,
    )
    expect(getByText('Restricted Page')).toBeInTheDocument()
  })
})
