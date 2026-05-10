import { ModalProvider } from '../modal-provider'
import ConfirmModal from './confirm-modal'
import { renderWithModalProvider, useUser } from '@/utils/test-utils'

const mockCloseModal = jest.fn()

jest.mock('../use-modals', () => ({
  useModals: () => ({
    closeModal: mockCloseModal,
  }),
}))

describe('components/modals/confirm-modal', () => {
  it('should render defaults', () => {
    expect(
      renderWithModalProvider(
        <ConfirmModal open onConfirm={jest.fn} />,
      ).asFragment(),
    ).toMatchSnapshot()
  })

  it('should render with passed props', () => {
    expect(
      renderWithModalProvider(
        <ConfirmModal
          open
          title='Test title'
          message='Test message'
          onConfirm={jest.fn}
        />,
      ).asFragment(),
    ).toMatchSnapshot()
  })

  it('should call onConfirm when confirm button is clicked', async () => {
    const onConfirm = jest.fn()

    const { getByText, user } = useUser(
      <ConfirmModal open onConfirm={onConfirm} />,
      { wrapper: ModalProvider },
    )

    await user.click(getByText('Confirm'))

    expect(onConfirm).toHaveBeenCalled()
  })

  it('should call closeModal when cancel button is clicked', async () => {
    const { getByText, user } = useUser(
      <ConfirmModal open onConfirm={jest.fn} />,
      { wrapper: ModalProvider },
    )

    await user.click(getByText('Cancel'))
    expect(mockCloseModal).toHaveBeenCalled()
  })
})
