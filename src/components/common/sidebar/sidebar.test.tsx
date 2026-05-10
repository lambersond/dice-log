import { Sidebar } from './sidebar'
import { render, useUser, screen } from '@/utils/test-utils'

describe('components/common/sidebar', () => {
  it('toggles sidebar on button click', async () => {
    const { user } = useUser(
      <Sidebar trigger={<button>trigger</button>}>content</Sidebar>,
    )

    expect(screen.getByTestId('sidebar')).toHaveClass('-translate-x-full')

    await user.click(screen.getByTestId('sidebar__button'))

    expect(screen.getByTestId('sidebar')).toHaveClass('translate-x-0')

    await user.click(screen.getByTestId('sidebar__overlay'))

    expect(screen.getByTestId('sidebar')).toHaveClass('-translate-x-full')
  })

  it('renders right-side transform when side="right"', async () => {
    const { user } = useUser(
      <Sidebar trigger={<button>trigger</button>} side='right'>
        content
      </Sidebar>,
    )

    expect(screen.getByTestId('sidebar')).toHaveClass('translate-x-full')

    await user.click(screen.getByTestId('sidebar__button'))

    expect(screen.getByTestId('sidebar')).toHaveClass('translate-x-0')
    expect(screen.getByTestId('sidebar')).toHaveClass('right-0')
  })

  it('omits the trigger in controlled mode (no trigger prop)', () => {
    render(
      <Sidebar isOpen={false} onClose={jest.fn()}>
        content
      </Sidebar>,
    )

    expect(screen.queryByTestId('sidebar__button')).toBeNull()
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
  })

  it('respects the controlled isOpen prop and calls controlled onClose', async () => {
    const onClose = jest.fn()
    const { rerender, user } = useUser(
      <Sidebar isOpen={false} onClose={onClose}>
        content
      </Sidebar>,
    )

    expect(screen.getByTestId('sidebar')).toHaveClass('-translate-x-full')

    rerender(
      <Sidebar isOpen onClose={onClose}>
        content
      </Sidebar>,
    )

    expect(screen.getByTestId('sidebar')).toHaveClass('translate-x-0')

    await user.click(screen.getByTestId('sidebar__overlay'))

    expect(onClose).toHaveBeenCalled()
  })

  it('forwards original onClick on the trigger before opening', async () => {
    const triggerClick = jest.fn()
    const { user } = useUser(
      <Sidebar trigger={<button onClick={triggerClick}>open</button>}>
        content
      </Sidebar>,
    )

    await user.click(screen.getByTestId('sidebar__button'))

    expect(triggerClick).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('sidebar')).toHaveClass('translate-x-0')
  })

  it('closes when Escape is pressed on the overlay', async () => {
    const { user } = useUser(
      <Sidebar trigger={<button>open</button>}>content</Sidebar>,
    )

    await user.click(screen.getByTestId('sidebar__button'))
    expect(screen.getByTestId('sidebar')).toHaveClass('translate-x-0')

    screen.getByTestId('sidebar__overlay').focus()
    await user.keyboard('{Escape}')

    expect(screen.getByTestId('sidebar')).toHaveClass('-translate-x-full')
  })

  it('ignores non-Escape keys on the overlay', async () => {
    const { user } = useUser(
      <Sidebar trigger={<button>open</button>}>content</Sidebar>,
    )

    await user.click(screen.getByTestId('sidebar__button'))
    screen.getByTestId('sidebar__overlay').focus()
    await user.keyboard('a')

    expect(screen.getByTestId('sidebar')).toHaveClass('translate-x-0')
  })
})
