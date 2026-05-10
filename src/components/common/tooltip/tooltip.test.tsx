import { Tooltip } from './tooltip'
import { render, screen, useUser } from '@/utils/test-utils'

describe('components/common/tooltip', () => {
  it('should match the snapshot', () => {
    expect(
      render(<Tooltip title='title'>Hover</Tooltip>).asFragment(),
    ).toMatchSnapshot()
  })

  it('should show tooltip on hover - asChild component', async () => {
    const { user } = useUser(
      <Tooltip title='title' asChild>
        <p>Hover</p>
      </Tooltip>,
    )

    await user.hover(screen.getByText('Hover'))

    expect(await screen.findByText('title')).toBeInTheDocument()
  })

  it('should show tooltip on hover - text child', async () => {
    const { user } = useUser(<Tooltip title='title'>Hover</Tooltip>)

    await user.hover(screen.getByText('Hover'))

    expect(await screen.findByText('title')).toBeInTheDocument()
  })
})
