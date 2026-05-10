import { Switch } from './switch'
import { render, screen, useUser } from '@/utils/test-utils'

describe('components/common/input/switch', () => {
  it('renders the label and toggles when clicked', async () => {
    const { user } = useUser(<Switch label='Enabled' name='enabled' />)

    expect(screen.getByText('Enabled')).toBeInTheDocument()

    const input = screen.getByLabelText('Enabled') as HTMLInputElement
    expect(input.checked).toBe(false)

    await user.click(input)
    expect(input.checked).toBe(true)
  })

  it('disables the input when disabled is true', () => {
    render(<Switch label='Off' name='off' disabled />)

    expect(screen.getByLabelText('Off')).toBeDisabled()
  })

  it.each(['sm', 'md', 'lg'] as const)('renders the %s track size', size => {
    render(
      <Switch label={`track-${size}`} name={`track-${size}`} size={size} />,
    )

    expect(screen.getByLabelText(`track-${size}`)).toBeInTheDocument()
  })

  it.each(['sm', 'md', 'lg'] as const)(
    'renders the %s label size',
    labelSize => {
      render(
        <Switch
          label={`label-${labelSize}`}
          name={`label-${labelSize}`}
          labelSize={labelSize}
        />,
      )

      expect(screen.getByLabelText(`label-${labelSize}`)).toBeInTheDocument()
    },
  )

  it('renders vertical orientation', () => {
    render(<Switch label='V' name='v' orientation='vertical' />)

    expect(screen.getByLabelText('V')).toBeInTheDocument()
  })

  it('renders left and right side text', () => {
    render(<Switch label='Sides' name='sides' leftText='Off' rightText='On' />)

    expect(screen.getByText('Off')).toBeInTheDocument()
    expect(screen.getByText('On')).toBeInTheDocument()
  })
})
