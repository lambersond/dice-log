import { Group } from './group'
import { render, screen, useUser } from '@/utils/test-utils'

describe('components/common/menu/group', () => {
  it('renders the header label and icon when showHeader is true', () => {
    render(
      <Group
        key='g1'
        label='Group A'
        icon={<span data-testid='group-icon' />}
        showHeader
        options={[{ label: 'Item', onClick: jest.fn() }]}
      />,
    )

    expect(screen.getByText('Group A')).toBeInTheDocument()
    expect(screen.getByTestId('group-icon')).toBeInTheDocument()
  })

  it('hides the header when showHeader is false', () => {
    render(
      <Group
        key='g2'
        label='Hidden Group'
        showHeader={false}
        options={[{ label: 'Item', onClick: jest.fn() }]}
      />,
    )

    expect(screen.getByText('Hidden Group').className).toMatch(/hidden/)
  })

  it('shows the empty text when no options are provided', () => {
    render(<Group key='g3' label='Empty' showHeader options={[]} />)

    expect(screen.getByText('No options available')).toBeInTheDocument()
  })

  it('shows custom emptyText', () => {
    render(
      <Group
        key='g4'
        label='Empty'
        showHeader
        emptyText='Nothing here'
        options={[]}
      />,
    )

    expect(screen.getByText('Nothing here')).toBeInTheDocument()
  })

  it('renders options and handles clicks', async () => {
    const onClick = jest.fn()
    const { user } = useUser(
      <Group
        key='g5'
        label='With items'
        showHeader
        options={[{ label: 'Action', onClick }]}
      />,
    )

    await user.click(screen.getByText('Action'))

    expect(onClick).toHaveBeenCalled()
  })
})
