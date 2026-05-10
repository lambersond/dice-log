import { useModals } from './use-modals'
import { ModalProvider } from '@/components/modals/modal-provider'
import { renderHook, screen, waitFor } from '@/utils/test-utils'

describe('hooks/use-modals', () => {
  it('should throw error if not wrapped in provider', () => {
    expect(() => renderHook(() => useModals())).toThrow(
      'useModals must be used within a ModalProvider',
    )
  })

  it.each([['confirm', { onConfirm: jest.fn() }]] as const)(
    'should open modal - %s',
    async (modal, props) => {
      const { result } = renderHook(() => useModals(), {
        wrapper: ModalProvider,
      })

      await waitFor(() => {
        result.current.openModal(modal, props)
      })

      await waitFor(() => {
        expect(screen.getByTestId('modal')).toBeInTheDocument()
      })
    },
  )

  it('should close modal', async () => {
    const { result } = renderHook(() => useModals(), {
      wrapper: ModalProvider,
    })

    await waitFor(() => {
      result.current.openModal('confirm', { onConfirm: jest.fn() })
    })

    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument()
    })

    await waitFor(() => {
      result.current.closeModal('confirm')
    })

    await waitFor(() => {
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
    })
  })
})
