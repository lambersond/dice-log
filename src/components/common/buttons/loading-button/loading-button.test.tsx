import { LoadingButton } from './loading-button'
import { render, screen, useUser, waitFor } from '@/utils/test-utils'

describe('components/common/button/loading-button', () => {
  it('renders nothing when hasEdit is false (default)', () => {
    const { container } = render(<LoadingButton>Save</LoadingButton>)

    expect(container).toBeEmptyDOMElement()
  })

  it('renders when hasEdit is true', () => {
    render(<LoadingButton hasEdit>Save</LoadingButton>)

    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  it('renders the Icon while idle', () => {
    render(
      <LoadingButton hasEdit Icon={<span data-testid='icon' />}>
        Save
      </LoadingButton>,
    )

    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('shows loaded text after click then returns to idle', async () => {
    const onClick = jest.fn()
    const { user } = useUser(
      <LoadingButton hasEdit onClick={onClick} loadedTextDurationMs={50}>
        Save
      </LoadingButton>,
    )

    await user.click(screen.getByRole('button'))

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(await screen.findByText('Loaded')).toBeInTheDocument()

    await waitFor(() =>
      expect(screen.queryByText('Loaded')).not.toBeInTheDocument(),
    )
    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  it('uses a custom loadedText', async () => {
    const { user } = useUser(
      <LoadingButton hasEdit loadedText='Done!' loadedTextDurationMs={1000}>
        Save
      </LoadingButton>,
    )

    await user.click(screen.getByRole('button'))

    expect(await screen.findByText('Done!')).toBeInTheDocument()
  })

  it('handles a click without an onClick handler', async () => {
    const { user } = useUser(
      <LoadingButton hasEdit loadedTextDurationMs={1000}>
        Save
      </LoadingButton>,
    )

    await user.click(screen.getByRole('button'))

    expect(await screen.findByText('Loaded')).toBeInTheDocument()
  })
})
