import { Popover } from './popover'
import { useUser } from '@/utils/test-utils'

describe('components/common/popover', () => {
  it('should open & close popover on click', async () => {
    const { getByText, queryByText, user } = useUser(
      <Popover content='content'>My Popover</Popover>,
    )

    await user.click(getByText('My Popover'))

    expect(getByText('content')).toBeInTheDocument()

    await user.click(getByText('My Popover'))

    expect(queryByText('content')).not.toBeInTheDocument()
  })

  it('should handle component as trigger', async () => {
    const { getByText, user } = useUser(
      <Popover asChild content='content'>
        <button>trigger-as-button</button>
      </Popover>,
    )

    await user.click(getByText('trigger-as-button'))

    expect(getByText('content')).toBeInTheDocument()
  })

  it('should handle component as content', async () => {
    const { getByText, user } = useUser(
      <Popover
        asChild
        content={
          <div>
            <p>content-as-component</p>
          </div>
        }
      >
        trigger
      </Popover>,
    )

    await user.click(getByText('trigger'))

    expect(getByText('content-as-component')).toBeInTheDocument()
  })

  it('should handle kebab icon as trigger', async () => {
    const { getByTestId, getByText, user } = useUser(
      <Popover asKabab content='content' />,
    )

    await user.click(getByTestId('MoreVertIcon'))

    expect(getByText('content')).toBeInTheDocument()
  })

  it('renders only the children when hidePopover is true', () => {
    const { getByText, queryByText } = useUser(
      <Popover hidePopover content='content'>
        <span>just-children</span>
      </Popover>,
    )

    expect(getByText('just-children')).toBeInTheDocument()
    expect(queryByText('content')).not.toBeInTheDocument()
  })
})
