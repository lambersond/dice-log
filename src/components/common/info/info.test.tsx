import { Info } from './info'
import { render, screen, useUser } from '@/utils/test-utils'

describe('components/common/info', () => {
  it('renders the info icon', () => {
    const { container } = render(<Info info='Helpful info' />)

    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('shows the info text in a tooltip on hover', async () => {
    const { user } = useUser(<Info info='Helpful info' />)

    await user.hover(screen.getByRole('button'))

    expect(await screen.findByText('Helpful info')).toBeInTheDocument()
  })
})
