import { NumberIncrementor } from './number-incrementor'
import { fireEvent, render, screen, useUser } from '@/utils/test-utils'

describe('components/common/input/number-incrementor', () => {
  it('renders the default value of 0', () => {
    render(<NumberIncrementor />)

    expect(screen.getByRole('spinbutton')).toHaveValue(0)
  })

  it('uses defaultValue when provided (uncontrolled)', () => {
    render(<NumberIncrementor defaultValue={5} />)

    expect(screen.getByRole('spinbutton')).toHaveValue(5)
  })

  it('increments when + is clicked (uncontrolled)', async () => {
    const { user } = useUser(<NumberIncrementor defaultValue={2} />)

    await user.click(screen.getByText('+'))

    expect(screen.getByRole('spinbutton')).toHaveValue(3)
  })

  it('decrements when - is clicked (uncontrolled)', async () => {
    const { user } = useUser(<NumberIncrementor defaultValue={2} />)

    await user.click(screen.getByText('-'))

    expect(screen.getByRole('spinbutton')).toHaveValue(1)
  })

  it('calls onChange but does not update internal state when controlled', async () => {
    const onChange = jest.fn()
    const { user } = useUser(
      <NumberIncrementor value={4} onChange={onChange} />,
    )

    await user.click(screen.getByText('+'))

    expect(onChange).toHaveBeenCalledWith(5)
    expect(screen.getByRole('spinbutton')).toHaveValue(4)
  })

  it('updates value when a valid number is entered', () => {
    const onChange = jest.fn()
    render(<NumberIncrementor defaultValue={1} onChange={onChange} />)

    fireEvent.change(screen.getByRole('spinbutton'), {
      target: { value: '7' },
    })

    expect(onChange).toHaveBeenLastCalledWith(7)
    expect(screen.getByRole('spinbutton')).toHaveValue(7)
  })

  it('ignores empty / non-numeric input', () => {
    const onChange = jest.fn()
    render(<NumberIncrementor defaultValue={3} onChange={onChange} />)

    fireEvent.change(screen.getByRole('spinbutton'), {
      target: { value: '' },
    })

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('spinbutton')).toHaveValue(3)
  })
})
