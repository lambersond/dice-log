import { Menu } from './menu'
import { render, screen, useUser } from '@/utils/test-utils'

describe('components/common/menu', () => {
  it('handles flat option clicks', async () => {
    const onClick = jest.fn()
    const { user } = useUser(<Menu options={[{ label: 'Edit', onClick }]} />)

    await user.click(screen.getByText('Edit'))

    expect(onClick).toHaveBeenCalled()
  })

  it('renders a divider above an option that has divider=true', () => {
    const { container } = render(
      <Menu
        options={[
          { label: 'A', onClick: jest.fn() },
          { label: 'B', onClick: jest.fn(), divider: true },
        ]}
      />,
    )

    expect(container.querySelectorAll('.border-t').length).toBe(1)
  })

  it('renders the danger color variant', () => {
    render(
      <Menu
        options={[{ label: 'Delete', onClick: jest.fn(), color: 'danger' }]}
      />,
    )

    expect(screen.getByText('Delete').className).toMatch(/text-danger/)
  })

  it('renders an option icon', () => {
    render(
      <Menu
        options={[
          {
            label: 'With icon',
            onClick: jest.fn(),
            icon: <span data-testid='option-icon' />,
          },
        ]}
      />,
    )

    expect(screen.getByTestId('option-icon')).toBeInTheDocument()
  })

  it('renders a group when given a GroupOption', async () => {
    const onClick = jest.fn()
    const { user } = useUser(
      <Menu
        options={[
          {
            key: 'g1',
            label: 'Group A',
            showHeader: true,
            options: [{ label: 'Inside', onClick }],
          },
        ]}
      />,
    )

    expect(screen.getByText('Group A')).toBeInTheDocument()

    await user.click(screen.getByText('Inside'))
    expect(onClick).toHaveBeenCalled()
  })
})
