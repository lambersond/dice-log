import { TimezonePanel } from './timezone-panel'
import { useUser } from '@/utils/test-utils'

describe('components/common/datetime-picker/timezone-panel', () => {
  it('lists timezones and pre-focuses the search input', () => {
    const { getByPlaceholderText, getAllByRole } = useUser(
      <TimezonePanel value='America/New_York' onChange={jest.fn()} />,
    )

    const search = getByPlaceholderText(/search for timezones/i)
    expect(search).toHaveFocus()

    // The list should render at least dozens of options on any platform with
    // Intl.supportedValuesOf; UTC alone is the floor.
    const buttons = getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('marks the active timezone with aria-pressed=true', () => {
    const { getByRole } = useUser(
      <TimezonePanel value='America/New_York' onChange={jest.fn()} />,
    )

    const button = getByRole('button', { name: /new york/i })
    expect(button).toHaveAttribute('aria-pressed', 'true')
  })

  it('filters the list as the user types', async () => {
    const { getAllByRole, getByPlaceholderText, user } = useUser(
      <TimezonePanel value='UTC' onChange={jest.fn()} />,
    )

    await user.type(getByPlaceholderText(/search for timezones/i), 'london')

    const buttons = getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
    for (const button of buttons) {
      expect(button.textContent?.toLowerCase()).toMatch(
        /london|gmt|bst|europe/i,
      )
    }
  })

  it('shows the empty state when no timezone matches the search', async () => {
    const { getByPlaceholderText, getByText, user } = useUser(
      <TimezonePanel value='UTC' onChange={jest.fn()} />,
    )

    await user.type(
      getByPlaceholderText(/search for timezones/i),
      'no-such-place-anywhere',
    )

    expect(getByText(/no timezones match/i)).toBeInTheDocument()
  })

  it('calls onChange with the timezone id when a row is clicked', async () => {
    const onChange = jest.fn()
    const { getByRole, user } = useUser(
      <TimezonePanel value='UTC' onChange={onChange} />,
    )

    await user.click(getByRole('button', { name: /new york/i }))

    expect(onChange).toHaveBeenCalledWith('America/New_York')
  })
})
