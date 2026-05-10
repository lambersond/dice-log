import { DateTimePicker } from './datetime-picker'
import { screen, useUser } from '@/utils/test-utils'

describe('components/common/datetime-picker', () => {
  it('renders the placeholder when value is empty', () => {
    const { getByPlaceholderText } = useUser(
      <DateTimePicker
        label='Released At'
        value=''
        onChange={jest.fn()}
        defaultTimezone='UTC'
      />,
    )
    expect(getByPlaceholderText(/select a timestamp/i)).toBeInTheDocument()
  })

  it('renders the formatted display when value is provided', () => {
    const { getByDisplayValue } = useUser(
      <DateTimePicker
        label='Released At'
        value='2026-04-30T18:30:00.000Z'
        onChange={jest.fn()}
        defaultTimezone='America/New_York'
      />,
    )
    expect(getByDisplayValue(/04\/30\/2026/)).toBeInTheDocument()
  })

  it('shows the timezone short abbreviation in an end-adornment button', () => {
    const { getByRole } = useUser(
      <DateTimePicker
        label='Released At'
        value='2026-07-01T12:00:00.000Z'
        onChange={jest.fn()}
        defaultTimezone='America/New_York'
      />,
    )
    const tzButton = getByRole('button', { name: /change timezone/i })
    expect(tzButton.textContent).toMatch(/EDT|EST/)
  })

  it('opens the calendar popover when the input is clicked', async () => {
    const { getByPlaceholderText, getByRole, queryByRole, user } = useUser(
      <DateTimePicker
        label='Released At'
        value=''
        onChange={jest.fn()}
        defaultTimezone='UTC'
      />,
    )
    expect(
      queryByRole('button', { name: /previous month/i }),
    ).not.toBeInTheDocument()
    await user.click(getByPlaceholderText(/select a timestamp/i))
    expect(getByRole('button', { name: /previous month/i })).toBeInTheDocument()
  })

  it('emits an ISO value when a calendar day is selected', async () => {
    const onChange = jest.fn()
    const { getAllByRole, getByPlaceholderText, user } = useUser(
      <DateTimePicker
        label='Released At'
        value='2026-04-15T12:00:00.000Z'
        onChange={onChange}
        defaultTimezone='UTC'
      />,
    )
    await user.click(getByPlaceholderText(/select a timestamp/i))
    // Find a button labelled "20" inside the day grid (not the time row).
    const dayButtons = getAllByRole('button').filter(
      b => b.textContent === '20',
    )
    expect(dayButtons.length).toBeGreaterThan(0)
    await user.click(dayButtons[0])
    expect(onChange).toHaveBeenCalled()
    const lastCall = onChange.mock.calls.at(-1) as [string]
    expect(lastCall[0]).toMatch(/^2026-\d{2}-20T/)
  })

  it('emits an empty value when Clear is clicked', async () => {
    const onChange = jest.fn()
    const { getByPlaceholderText, getByRole, user } = useUser(
      <DateTimePicker
        label='Released At'
        value='2026-04-15T12:00:00.000Z'
        onChange={onChange}
        defaultTimezone='UTC'
      />,
    )
    await user.click(getByPlaceholderText(/select a timestamp/i))
    await user.click(getByRole('button', { name: /^clear$/i }))
    expect(onChange).toHaveBeenLastCalledWith('')
  })

  it('opens the timezone panel when the badge is clicked', async () => {
    const { getByPlaceholderText, getByRole, queryByPlaceholderText, user } =
      useUser(
        <DateTimePicker
          label='Released At'
          value='2026-04-15T12:00:00.000Z'
          onChange={jest.fn()}
          defaultTimezone='America/New_York'
        />,
      )

    expect(
      queryByPlaceholderText(/search for timezones/i),
    ).not.toBeInTheDocument()

    await user.click(getByRole('button', { name: /change timezone/i }))

    expect(getByPlaceholderText(/search for timezones/i)).toBeInTheDocument()
  })

  it('closes the calendar and opens the tz panel when the badge is clicked while the calendar is open', async () => {
    const { getByPlaceholderText, getByRole, queryByRole, user } = useUser(
      <DateTimePicker
        label='Released At'
        value='2026-04-15T12:00:00.000Z'
        onChange={jest.fn()}
        defaultTimezone='America/New_York'
      />,
    )

    await user.click(getByPlaceholderText(/select a timestamp/i))
    expect(getByRole('button', { name: /previous month/i })).toBeInTheDocument()

    await user.click(getByRole('button', { name: /change timezone/i }))

    expect(
      queryByRole('button', { name: /previous month/i }),
    ).not.toBeInTheDocument()
    expect(getByPlaceholderText(/search for timezones/i)).toBeInTheDocument()
  })

  it('emits an iso when the user pastes a parseable timestamp', async () => {
    const onChange = jest.fn()
    const { getByPlaceholderText, user } = useUser(
      <DateTimePicker
        label='Released At'
        value=''
        onChange={onChange}
        defaultTimezone='UTC'
      />,
    )

    const input = getByPlaceholderText(/select a timestamp/i)
    await user.click(input)
    await user.paste('2026-04-30T18:30:00.000Z')

    expect(onChange).toHaveBeenCalledWith('2026-04-30T18:30:00.000Z')
  })

  it('does not emit when the pasted text is unparseable', async () => {
    const onChange = jest.fn()
    const { getByPlaceholderText, user } = useUser(
      <DateTimePicker
        label='Released At'
        value=''
        onChange={onChange}
        defaultTimezone='UTC'
      />,
    )

    const input = getByPlaceholderText(/select a timestamp/i)
    await user.click(input)
    await user.paste('not a date')

    expect(onChange).not.toHaveBeenCalled()
  })

  it('closes the open popup when Escape is pressed', async () => {
    const { getByPlaceholderText, getByRole, queryByRole, user } = useUser(
      <DateTimePicker
        label='Released At'
        value=''
        onChange={jest.fn()}
        defaultTimezone='UTC'
      />,
    )

    await user.click(getByPlaceholderText(/select a timestamp/i))
    expect(getByRole('button', { name: /previous month/i })).toBeInTheDocument()

    await user.keyboard('{Escape}')

    expect(
      queryByRole('button', { name: /previous month/i }),
    ).not.toBeInTheDocument()
  })

  it('closes the open popup when the user clicks outside the picker', async () => {
    const { getByPlaceholderText, getByText, queryByRole, user } = useUser(
      <div>
        <button>outside</button>
        <DateTimePicker
          label='Released At'
          value=''
          onChange={jest.fn()}
          defaultTimezone='UTC'
        />
      </div>,
    )

    await user.click(getByPlaceholderText(/select a timestamp/i))
    expect(queryByRole('button', { name: /previous month/i })).toBeTruthy()

    await user.click(getByText('outside'))

    expect(
      queryByRole('button', { name: /previous month/i }),
    ).not.toBeInTheDocument()
  })

  it('emits an iso when the user types a wall-clock string into the input', async () => {
    const onChange = jest.fn()
    const { getByPlaceholderText, user } = useUser(
      <DateTimePicker
        label='Released At'
        value=''
        onChange={onChange}
        defaultTimezone='UTC'
      />,
    )

    const input = getByPlaceholderText(/select a timestamp/i)
    await user.click(input)
    await user.keyboard('2026-04-30T18:30:00')

    const lastCall = onChange.mock.calls.at(-1) as [string]
    expect(lastCall[0]).toMatch(/^2026-04-30T18:30/)
  })

  it('renders an asterisk when required is true', () => {
    const { getByText } = useUser(
      <DateTimePicker
        label='Released At'
        value=''
        onChange={jest.fn()}
        defaultTimezone='UTC'
        required
      />,
    )

    expect(getByText('*')).toBeInTheDocument()
  })

  it('renders the error message when error is set', () => {
    const { getByText } = useUser(
      <DateTimePicker
        label='Released At'
        value=''
        onChange={jest.fn()}
        defaultTimezone='UTC'
        error='Released at is required'
      />,
    )

    expect(getByText('Released at is required')).toBeInTheDocument()
  })

  it('reverts unparseable typed text to the formatted value on blur', async () => {
    const { getByDisplayValue, user } = useUser(
      <DateTimePicker
        label='Released At'
        value='2026-04-30T18:30:00.000Z'
        onChange={jest.fn()}
        defaultTimezone='America/New_York'
      />,
    )

    const input = getByDisplayValue(/04\/30\/2026/) as HTMLInputElement
    await user.click(input)
    await user.clear(input)
    await user.keyboard('garbage')
    expect(input.value).toBe('garbage')

    // Tab away from the input to trigger blur.
    await user.tab()

    expect(input.value).toMatch(/04\/30\/2026/)
  })

  it('updates the displayed timezone when a new one is picked from the panel', async () => {
    const { getByPlaceholderText, getByRole, user } = useUser(
      <DateTimePicker
        label='Released At'
        value='2026-07-01T12:00:00.000Z'
        onChange={jest.fn()}
        defaultTimezone='America/New_York'
      />,
    )

    const badge = getByRole('button', { name: /change timezone/i })
    const initialBadge = badge.textContent
    expect(initialBadge).toMatch(/EDT|EST/)

    await user.click(badge)
    await user.type(getByPlaceholderText(/search for timezones/i), 'Tokyo')

    // Panel options are the only buttons that carry aria-pressed.
    const tokyoOption = screen
      .getAllByRole('button')
      .find(b => b.hasAttribute('aria-pressed'))
    expect(tokyoOption).toBeDefined()
    await user.click(tokyoOption!)

    expect(badge.textContent).not.toBe(initialBadge)
  })

  it('renders the hint when no error is set and hides it when an error is set', () => {
    const { getByText, queryByText, rerender } = useUser(
      <DateTimePicker
        label='Released At'
        value=''
        onChange={jest.fn()}
        defaultTimezone='UTC'
        hint='When was this released?'
      />,
    )

    expect(getByText('When was this released?')).toBeInTheDocument()

    rerender(
      <DateTimePicker
        label='Released At'
        value=''
        onChange={jest.fn()}
        defaultTimezone='UTC'
        hint='When was this released?'
        error='Released at is required'
      />,
    )

    expect(queryByText('When was this released?')).not.toBeInTheDocument()
  })
})
