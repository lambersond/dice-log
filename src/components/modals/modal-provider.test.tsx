import { use } from 'react'
import { ModalDispatchCtx, ModalStateCtx } from './modal-context'
import { ModalProvider } from './modal-provider'
import { useUser } from '@/utils/test-utils'

function StateProbe() {
  const state = use(ModalStateCtx)
  return <pre data-testid='state'>{JSON.stringify(state ?? {})}</pre>
}

function Controls() {
  const dispatch = use(ModalDispatchCtx)!
  return (
    <div>
      <button
        type='button'
        onClick={() =>
          dispatch({ type: 'open', modal: 'confirm', props: {} as never })
        }
      >
        open-confirm
      </button>
      <button
        type='button'
        onClick={() => dispatch({ type: 'close', modal: 'confirm' })}
      >
        close-confirm
      </button>
    </div>
  )
}

describe('components/modals/modal-provider', () => {
  it('renders its children', () => {
    const { getByText } = useUser(
      <ModalProvider>
        <span>hello world</span>
      </ModalProvider>,
    )
    expect(getByText('hello world')).toBeInTheDocument()
  })

  it('starts with an empty state and exposes a dispatch fn', () => {
    const { getByTestId } = useUser(
      <ModalProvider>
        <StateProbe />
        <Controls />
      </ModalProvider>,
    )
    expect(getByTestId('state').textContent).toBe('{}')
  })

  it('opens a registered modal in response to dispatch', async () => {
    const { findByTestId, getByText, user } = useUser(
      <ModalProvider>
        <Controls />
      </ModalProvider>,
    )

    await user.click(getByText('open-confirm'))

    expect(await findByTestId('modal')).toBeInTheDocument()
  })

  it('closes the modal in response to a close dispatch', async () => {
    const { findByTestId, getByText, queryByTestId, user } = useUser(
      <ModalProvider>
        <Controls />
      </ModalProvider>,
    )

    await user.click(getByText('open-confirm'))
    await findByTestId('modal')

    await user.click(getByText('close-confirm'))

    expect(queryByTestId('modal')).not.toBeInTheDocument()
  })

  it('mounts a fresh modal on each open so prop-derived state does not leak', async () => {
    const dispatches: Array<{
      type: 'open' | 'close'
      props?: Record<string, unknown>
    }> = []

    function Probe() {
      const dispatch = use(ModalDispatchCtx)!
      const open = (props: Record<string, unknown>) => {
        dispatches.push({ type: 'open', props })
        dispatch({
          type: 'open',
          modal: 'confirm',
          props: props as never,
        })
      }
      const close = () => {
        dispatches.push({ type: 'close' })
        dispatch({ type: 'close', modal: 'confirm' })
      }
      return (
        <div>
          <button type='button' onClick={() => open({ title: 'First' })}>
            open-first
          </button>
          <button type='button' onClick={() => open({ title: 'Second' })}>
            open-second
          </button>
          <button type='button' onClick={close}>
            close
          </button>
        </div>
      )
    }

    const { findByText, getByText, queryByText, user } = useUser(
      <ModalProvider>
        <Probe />
      </ModalProvider>,
    )

    await user.click(getByText('open-first'))
    expect(await findByText('First')).toBeInTheDocument()

    await user.click(getByText('close'))
    expect(queryByText('First')).not.toBeInTheDocument()

    // Re-open with new props — the freshly-mounted modal must reflect them
    // rather than holding onto the previous open's title.
    await user.click(getByText('open-second'))
    expect(await findByText('Second')).toBeInTheDocument()
    expect(queryByText('First')).not.toBeInTheDocument()

    expect(dispatches).toHaveLength(3)
  })
})
