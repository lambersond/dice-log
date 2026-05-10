import { SessionWrapper } from './session-wrapper'
import { render } from '@/utils/test-utils'
import type { ReactNode } from 'react'

jest.mock('@/providers/ably', () => ({
  AblyProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

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
