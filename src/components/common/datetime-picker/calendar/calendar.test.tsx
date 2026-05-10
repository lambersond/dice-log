import { Calendar } from './calendar'
import { fireEvent, useUser } from '@/utils/test-utils'

const baseProps = {
  value: '2026-04-15T13:30:00.000Z',
  timezone: 'UTC',
  onChange: jest.fn(),
  onClear: jest.fn(),
}

describe('components/common/datetime-picker/calendar', () => {
  beforeEach(() => {
    baseProps.onChange.mockReset()
    baseProps.onClear.mockReset()
  })

  it('renders the month/year header for the value', () => {
    const { getByText } = useUser(<Calendar {...baseProps} />)
    expect(getByText('April')).toBeInTheDocument()
    expect(getByText('2026')).toBeInTheDocument()
  })

  it('falls back to today when the value is empty', () => {
    const { getByText } = useUser(<Calendar {...baseProps} value='' />)
    // Some month label is present; just assert that one of them renders.
    const label = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ].some(month => {
      try {
        getByText(month)
        return true
      } catch {
        return false
      }
    })
    expect(label).toBe(true)
  })

  it('navigates to the previous month, wrapping the year backwards', async () => {
    const { getByRole, getByText, user } = useUser(
      <Calendar {...baseProps} value='2026-01-15T12:00:00.000Z' />,
    )

    await user.click(getByRole('button', { name: /previous month/i }))

    expect(getByText('December')).toBeInTheDocument()
    expect(getByText('2025')).toBeInTheDocument()
  })

  it('navigates to the next month, wrapping the year forwards', async () => {
    const { getByRole, getByText, user } = useUser(
      <Calendar {...baseProps} value='2026-12-15T12:00:00.000Z' />,
    )

    await user.click(getByRole('button', { name: /next month/i }))

    expect(getByText('January')).toBeInTheDocument()
    expect(getByText('2027')).toBeInTheDocument()
  })

  it('emits "now" when Now is clicked', async () => {
    const onChange = jest.fn()
    const { getByRole, user } = useUser(
      <Calendar {...baseProps} onChange={onChange} />,
    )

    await user.click(getByRole('button', { name: /^now$/i }))

    expect(onChange).toHaveBeenCalled()
    expect(onChange.mock.calls[0][0]).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
    )
  })

  it('emits an iso when a day is selected', async () => {
    const onChange = jest.fn()
    const { getAllByRole, user } = useUser(
      <Calendar {...baseProps} onChange={onChange} />,
    )

    const day20 = getAllByRole('button').find(b => b.textContent === '20')
    expect(day20).toBeDefined()
    await user.click(day20 as HTMLElement)

    expect(onChange).toHaveBeenCalled()
    expect(onChange.mock.calls[0][0]).toMatch(/2026-04-20T13:30:00.000Z/)
  })

  it('changing the hour input forwards a 24h hour to onChange', () => {
    const onChange = jest.fn()
    const { getByLabelText } = useUser(
      <Calendar {...baseProps} onChange={onChange} />,
    )

    const hour = getByLabelText('Hour')
    // Starting at 1:30 PM. Setting hour-input to 5 with PM = 17:30 in 24h.
    fireEvent.change(hour, { target: { value: '5' } })

    expect(onChange).toHaveBeenCalled()
    expect(onChange.mock.calls[0][0]).toMatch(/T17:30:00.000Z/)
  })

  it('ignores out-of-range hour values', () => {
    const onChange = jest.fn()
    const { getByLabelText } = useUser(
      <Calendar {...baseProps} onChange={onChange} />,
    )

    const hour = getByLabelText('Hour')
    fireEvent.change(hour, { target: { value: '99' } })
    fireEvent.change(hour, { target: { value: 'abc' } })

    expect(onChange).not.toHaveBeenCalled()
  })

  it('toggles AM/PM, swapping the hour by 12', async () => {
    const onChange = jest.fn()
    // Start at noon UTC (12:00 PM = 12 in 24h).
    const { getByRole, user } = useUser(
      <Calendar
        {...baseProps}
        value='2026-04-15T12:00:00.000Z'
        onChange={onChange}
      />,
    )

    await user.click(getByRole('button', { name: 'PM' }))

    // Toggling PM → AM swaps 12 to 0 (midnight).
    expect(onChange).toHaveBeenCalled()
    expect(onChange.mock.calls[0][0]).toMatch(/2026-04-15T00:00:00/)
  })

  it('calls onClear when the Clear button is clicked', async () => {
    const onClear = jest.fn()
    const { getByRole, user } = useUser(
      <Calendar {...baseProps} onClear={onClear} />,
    )

    await user.click(getByRole('button', { name: /^clear$/i }))

    expect(onClear).toHaveBeenCalled()
  })

  it('disables day cells before the min date', () => {
    const { getAllByRole } = useUser(
      <Calendar
        {...baseProps}
        value='2026-04-15T13:30:00.000Z'
        min='2026-04-10T00:00:00.000Z'
      />,
    )

    const dayButton = (text: string) =>
      getAllByRole('button').find(b => b.textContent === text) as
        | HTMLButtonElement
        | undefined

    // April 9 is before min — disabled.
    expect(dayButton('9')?.disabled).toBe(true)
    // April 10 is the min day — enabled.
    expect(dayButton('10')?.disabled).toBe(false)
    // April 11 is after min — enabled.
    expect(dayButton('11')?.disabled).toBe(false)
  })

  it('does not emit onChange when a disabled day cell is clicked', async () => {
    const onChange = jest.fn()
    const { getAllByRole, user } = useUser(
      <Calendar
        {...baseProps}
        value='2026-04-15T13:30:00.000Z'
        onChange={onChange}
        min='2026-04-10T00:00:00.000Z'
      />,
    )

    const day5 = getAllByRole('button').find(b => b.textContent === '5')
    expect(day5).toBeDefined()
    await user.click(day5 as HTMLElement)

    expect(onChange).not.toHaveBeenCalled()
  })

  it('does not disable any cells when min is not provided', () => {
    const { getAllByRole } = useUser(
      <Calendar {...baseProps} value='2026-04-15T13:30:00.000Z' />,
    )

    const day5 = getAllByRole('button').find(b => b.textContent === '5') as
      | HTMLButtonElement
      | undefined
    expect(day5?.disabled).toBe(false)
  })

  it('clicking a leading-out-of-month day jumps the view to that month', async () => {
    const { getAllByRole, getByText, user } = useUser(
      <Calendar {...baseProps} value='2026-04-15T12:00:00.000Z' />,
    )

    // The first cell of April 2026 (a Wednesday) means the calendar starts
    // with March's last days: 29, 30, 31 in row 1. Click the first numeric
    // day cell (March 29). The view should switch to March 2026.
    const firstCell = getAllByRole('button').find(b =>
      /^\d+$/.test(b.textContent ?? ''),
    )
    expect(firstCell).toBeDefined()
    await user.click(firstCell as HTMLElement)

    expect(getByText('March')).toBeInTheDocument()
  })
})
