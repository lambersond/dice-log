import { popoverRegistry } from '../popover-registry'
import { Modal } from './modal'
import { render, screen, useClick } from '@/utils/test-utils'

describe('components/common/modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Modal Title',
  }

  it('should render the modal when isOpen is true', () => {
    const { getByText } = render(<Modal {...defaultProps}>Modal Content</Modal>)

    expect(getByText('Modal Title')).toBeInTheDocument()
    expect(getByText('Modal Content')).toBeInTheDocument()
  })

  it('should not render the modal when isOpen is false', () => {
    const { queryByText } = render(
      <Modal {...defaultProps} isOpen={false}>
        Modal Content
      </Modal>,
    )

    expect(queryByText('Modal Title')).not.toBeInTheDocument()
  })

  it('renders fullScreen layout when fullScreen is true', () => {
    render(
      <Modal {...defaultProps} fullScreen>
        Modal Content
      </Modal>,
    )

    const modal = screen.getByTestId('modal')
    expect(modal.className).toMatch(/min-w-full/)
  })

  it.each(['modal__backdrop', 'CloseIcon'])(
    'calls onClose when the %s is clicked',
    async testId => {
      const onCloseMock = jest.fn()
      const click = useClick(
        <Modal {...defaultProps} onClose={onCloseMock}>
          Modal Content
        </Modal>,
      )

      await click(screen.getByTestId(testId))

      expect(onCloseMock).toHaveBeenCalledTimes(1)
    },
  )

  it('does not close on backdrop click when a popover was open at mousedown', () => {
    const onCloseMock = jest.fn()
    render(
      <Modal {...defaultProps} onClose={onCloseMock}>
        Modal Content
      </Modal>,
    )

    popoverRegistry.add()
    try {
      const backdrop = screen.getByTestId('modal__backdrop')
      backdrop.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    } finally {
      popoverRegistry.remove()
    }
    // The popover has since closed (registry is back to 0) but the click that
    // follows the mousedown should still be ignored.
    screen.getByTestId('modal__backdrop').click()

    expect(onCloseMock).not.toHaveBeenCalled()
  })
})
