import { ColorPicker } from './color-picker'
import { fireEvent, render, screen } from '@/utils/test-utils'

const getColorInput = (container: HTMLElement) =>
  container.querySelector('input[type="color"]') as HTMLInputElement

describe('components/common/color-picker', () => {
  it('renders the label with required marker', () => {
    render(
      <ColorPicker
        label='Accent'
        value='#aabbcc'
        onChange={jest.fn()}
        required
      />,
    )

    expect(screen.getByText('Accent')).toBeInTheDocument()
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('renders hint when no error', () => {
    render(
      <ColorPicker
        label='Accent'
        value='#aabbcc'
        onChange={jest.fn()}
        hint='Pick a hex'
      />,
    )

    expect(screen.getByText('Pick a hex')).toBeInTheDocument()
  })

  it('shows error and hides hint when error is set', () => {
    render(
      <ColorPicker
        label='Accent'
        value='#aabbcc'
        onChange={jest.fn()}
        hint='Pick a hex'
        error='Invalid color'
      />,
    )

    expect(screen.getByText('Invalid color')).toBeInTheDocument()
    expect(screen.queryByText('Pick a hex')).not.toBeInTheDocument()
  })

  it('forwards typed hex with leading # to onChange', () => {
    const onChange = jest.fn()
    render(<ColorPicker label='Accent' value='#aabbcc' onChange={onChange} />)

    fireEvent.change(screen.getByLabelText('Accent'), {
      target: { value: '#112233' },
    })

    expect(onChange).toHaveBeenCalledWith('#112233')
  })

  it('prepends # when user types raw hex without it', () => {
    const onChange = jest.fn()
    render(<ColorPicker label='Accent' value='#aabbcc' onChange={onChange} />)

    fireEvent.change(screen.getByLabelText('Accent'), {
      target: { value: '112233' },
    })

    expect(onChange).toHaveBeenCalledWith('#112233')
  })

  it('forwards native color picker change to onChange', () => {
    const onChange = jest.fn()
    const { container } = render(
      <ColorPicker label='Accent' value='#aabbcc' onChange={onChange} />,
    )

    fireEvent.change(getColorInput(container), {
      target: { value: '#ff0000' },
    })

    expect(onChange).toHaveBeenCalledWith('#ff0000')
  })

  it('falls back to #000000 in the swatch when value is not a valid hex', () => {
    const { container } = render(
      <ColorPicker label='Accent' value='not-a-color' onChange={jest.fn()} />,
    )

    expect(getColorInput(container)).toHaveValue('#000000')
  })

  it('stops the next page click from reaching ancestors after the swatch is clicked', async () => {
    const ancestorHandler = jest.fn()
    const { container } = render(
      <>
        <ColorPicker label='Accent' value='#aabbcc' onChange={jest.fn()} />
        <button data-testid='nested' type='button'>
          Click me
        </button>
      </>,
    )

    // Native bubble-phase listener on the test container — fires only if the
    // event is actually allowed to propagate up the DOM.
    container.addEventListener('click', ancestorHandler)

    try {
      fireEvent.click(getColorInput(container))

      // armDismissGuard schedules its addEventListener via setTimeout(0); flush.
      await new Promise(resolve => setTimeout(resolve, 0))

      ancestorHandler.mockClear()

      fireEvent.click(screen.getByTestId('nested'))

      expect(ancestorHandler).not.toHaveBeenCalled()
    } finally {
      container.removeEventListener('click', ancestorHandler)
    }
  })
})
