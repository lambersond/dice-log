import { Sidebar } from './sidebar'
import { SidebarItem } from './sidebar-item'
import { useUser, screen } from '@/utils/test-utils'

describe('components/common/sidebar/sidebar-item', () => {
  it('closes the sidebar when clicked', async () => {
    const { user } = useUser(
      <Sidebar trigger={<button>open</button>}>
        <SidebarItem>Item</SidebarItem>
      </Sidebar>,
    )

    await user.click(screen.getByText('open'))
    await user.click(screen.getByText('Item'))

    expect(screen.getByTestId('sidebar')).toHaveClass('-translate-x-full')
  })
})
