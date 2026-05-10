import { Checkbox } from './checkbox'
import { render, screen, useUser } from '@/utils/test-utils'

describe('components/common/input/checkbox', () => {
  it('renders the label', () => {
    render(<Checkbox label='Accept terms' />)

    expect(screen.getByText('Accept terms')).toBeInTheDocument()
  })

  it('toggles when clicked (uncontrolled)', async () => {
    const { user } = useUser(<Checkbox label='Toggle me' />)

    const input = screen.getByLabelText('Toggle me') as HTMLInputElement
    expect(input.checked).toBe(false)

    await user.click(input)
    expect(input.checked).toBe(true)
  })

  it('respects defaultChecked', () => {
    render(<Checkbox label='Pre-checked' defaultChecked />)

    expect(
      (screen.getByLabelText('Pre-checked') as HTMLInputElement).checked,
    ).toBe(true)
  })

  it('treats `checked` prop as controlled and forwards changes via onChange', async () => {
    const onChange = jest.fn()
    const { user, rerender } = useUser(
      <Checkbox label='Controlled' checked={false} onChange={onChange} />,
    )

    const input = screen.getByLabelText('Controlled') as HTMLInputElement
    await user.click(input)

    expect(onChange).toHaveBeenCalled()
    expect(input.checked).toBe(false)

    rerender(<Checkbox label='Controlled' checked onChange={onChange} />)
    expect(
      (screen.getByLabelText('Controlled') as HTMLInputElement).checked,
    ).toBe(true)
  })

  it('disables the input when disabled is true', () => {
    render(<Checkbox label='Off' disabled />)

    expect(screen.getByLabelText('Off')).toBeDisabled()
  })

  it.each(['sm', 'md', 'lg'] as const)('renders the %s size', size => {
    render(<Checkbox label={`size-${size}`} size={size} />)

    expect(screen.getByLabelText(`size-${size}`)).toBeInTheDocument()
  })

  it.each([
    ['horizontal', 'end'],
    ['horizontal', 'start'],
    ['vertical', 'end'],
    ['vertical', 'start'],
  ] as const)(
    'renders direction=%s textDirection=%s',
    (direction, textDirection) => {
      render(
        <Checkbox
          label='Layout'
          direction={direction}
          textDirection={textDirection}
        />,
      )

      expect(screen.getByLabelText('Layout')).toBeInTheDocument()
    },
  )

  it('renders an info tooltip when info is provided', async () => {
    const { user, container } = useUser(
      <Checkbox label='With info' info='extra detail' />,
    )

    const infoSvgs = [...container.querySelectorAll('svg')]
    const infoIcon = infoSvgs.at(-1)!
    expect(infoIcon).toBeInTheDocument()

    await user.hover(infoIcon)
    expect(await screen.findByText('extra detail')).toBeInTheDocument()
  })

  it('uses provided id', () => {
    render(<Checkbox label='With id' id='my-id' />)

    expect(screen.getByLabelText('With id')).toHaveAttribute('id', 'my-id')
  })
})
