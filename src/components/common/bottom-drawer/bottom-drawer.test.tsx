import { BottomDrawer } from './bottom-drawer'
import { useUser, fireEvent } from '@/utils/test-utils'

describe('components/common/bottom-drawer', () => {
  it('renders children and the title in the header', () => {
    const { getByText, getByRole } = useUser(
      <BottomDrawer isOpen onClose={jest.fn()} title='DORA Details'>
        <p>Body</p>
      </BottomDrawer>,
    )
    expect(
      getByRole('heading', { level: 2, name: 'DORA Details' }),
    ).toBeInTheDocument()
    expect(getByText('Body')).toBeInTheDocument()
  })

  it('slides off-screen when closed', () => {
    const { getByTestId, rerender } = useUser(
      <BottomDrawer isOpen onClose={jest.fn()}>
        <p>Body</p>
      </BottomDrawer>,
    )
    expect(getByTestId('bottom-drawer').className).toContain('translate-y-0')
    rerender(
      <BottomDrawer isOpen={false} onClose={jest.fn()}>
        <p>Body</p>
      </BottomDrawer>,
    )
    expect(getByTestId('bottom-drawer').className).toContain('translate-y-full')
  })

  it('hides the overlay when closed', () => {
    const { queryByTestId } = useUser(
      <BottomDrawer isOpen={false} onClose={jest.fn()}>
        <p>Body</p>
      </BottomDrawer>,
    )
    expect(queryByTestId('bottom-drawer__overlay')).not.toBeInTheDocument()
  })

  it('calls onClose when the overlay is clicked', async () => {
    const onClose = jest.fn()
    const { getByTestId, user } = useUser(
      <BottomDrawer isOpen onClose={onClose}>
        <p>Body</p>
      </BottomDrawer>,
    )
    await user.click(getByTestId('bottom-drawer__overlay'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when the close icon is clicked', async () => {
    const onClose = jest.fn()
    const { getByTestId, user } = useUser(
      <BottomDrawer isOpen onClose={onClose}>
        <p>Body</p>
      </BottomDrawer>,
    )
    await user.click(getByTestId('bottom-drawer__close'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when Escape is pressed', () => {
    const onClose = jest.fn()
    useUser(
      <BottomDrawer isOpen onClose={onClose}>
        <p>Body</p>
      </BottomDrawer>,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })
})
