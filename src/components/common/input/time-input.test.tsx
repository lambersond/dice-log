import { TimeInput } from './time-input'
import { render, screen, useUser } from '@/utils/test-utils'

describe('components/common/input/time-input', () => {
  it('renders the formatted MM:SS for the given value', () => {
    render(<TimeInput value={125} onChange={jest.fn()} />)

    expect(screen.getByRole('textbox')).toHaveValue('02:05')
  })

  it('uses the default value of 300 (05:00) when none provided', () => {
    render(<TimeInput onChange={jest.fn()} />)

    expect(screen.getByRole('textbox')).toHaveValue('05:00')
  })

  it('updates value via onChange when typing a complete MM:SS', async () => {
    const onChange = jest.fn()
    const { user } = useUser(<TimeInput value={0} onChange={onChange} />)

    const input = screen.getByRole('textbox')
    await user.clear(input)
    await user.type(input, '0130')

    expect(onChange).toHaveBeenLastCalledWith(90)
  })

  it('strips non-digit characters from input', async () => {
    const onChange = jest.fn()
    const { user } = useUser(<TimeInput value={0} onChange={onChange} />)

    const input = screen.getByRole('textbox')
    await user.clear(input)
    await user.type(input, 'a1b:30')

    expect(input).toHaveValue('1:30')
  })

  it('does not call onChange when seconds exceed 59', async () => {
    const onChange = jest.fn()
    const { user } = useUser(<TimeInput value={0} onChange={onChange} />)

    const input = screen.getByRole('textbox')
    await user.clear(input)
    await user.type(input, '0199')

    expect(onChange).not.toHaveBeenCalled()
  })

  it('reformats text on blur from the current value', async () => {
    const { user } = useUser(<TimeInput value={65} onChange={jest.fn()} />)

    const input = screen.getByRole('textbox')
    await user.clear(input)
    await user.type(input, '99')
    await user.tab()

    expect(input).toHaveValue('01:05')
  })

  it('resyncs text when the value prop changes', () => {
    const { rerender } = render(<TimeInput value={60} onChange={jest.fn()} />)

    expect(screen.getByRole('textbox')).toHaveValue('01:00')

    rerender(<TimeInput value={3725} onChange={jest.fn()} />)
    expect(screen.getByRole('textbox')).toHaveValue('62:05')
  })
})
