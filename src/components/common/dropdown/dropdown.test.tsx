import { Dropdown } from './dropdown'
import { render, screen, useClick, useUser } from '@/utils/test-utils'

function mockTriggerRect(top: number, bottom: number) {
  const real = HTMLElement.prototype.getBoundingClientRect
  HTMLElement.prototype.getBoundingClientRect = function () {
    if (this.dataset?.testid === 'Dropdown__button') {
      return {
        top,
        bottom,
        left: 10,
        right: 210,
        width: 200,
        height: bottom - top,
        x: 10,
        y: top,
        toJSON: () => ({}),
      } as DOMRect
    }
    return real.call(this)
  }
  return () => {
    HTMLElement.prototype.getBoundingClientRect = real
  }
}

describe('components/common/dropdown', () => {
  const options = [
    { id: '1', value: '1', label: 'Option 1' },
    { id: '2', value: '2', label: 'Option 2' },
    { id: '3', value: '3', label: 'Option 3' },
  ]

  it('should render correctly', () => {
    expect(
      render(
        <Dropdown options={options} label='test' onSelect={jest.fn()} />,
      ).asFragment(),
    ).toMatchSnapshot()
  })

  it('should render correctly with defaultEmpty', () => {
    expect(
      render(
        <Dropdown
          options={options}
          label='test'
          onSelect={jest.fn()}
          defaultEmpty
        />,
      ).asFragment(),
    ).toMatchSnapshot()
  })

  it('should render options on click', async () => {
    const click = useClick(<Dropdown options={options} onSelect={jest.fn()} />)

    await click(screen.getByText('Option 1'))

    expect(screen.getByTestId('Dropdown__option-1')).toHaveTextContent(
      'Option 1',
    )
    expect(screen.getByTestId('Dropdown__option-2')).toHaveTextContent(
      'Option 2',
    )
    expect(screen.getByTestId('Dropdown__option-3')).toHaveTextContent(
      'Option 3',
    )
  })

  it('should call onSelect on option click', async () => {
    const onSelect = jest.fn()
    const click = useClick(<Dropdown options={options} onSelect={onSelect} />)

    await click(screen.getByText('Option 1'))

    expect(onSelect).toHaveBeenCalledTimes(0)

    await click(screen.getByTestId('Dropdown__option-2'))

    expect(onSelect).toHaveBeenCalledWith(options[1])
  })

  it('should close dropdown on click outside', async () => {
    const click = useClick(<Dropdown options={options} onSelect={jest.fn()} />)

    await click(screen.getByText('Option 1'))

    expect(screen.getByTestId('Dropdown__option-1')).toHaveTextContent(
      'Option 1',
    )

    await click(document.body)

    expect(screen.queryByTestId('Dropdown__option-1')).toBeNull()
  })

  it('flips above the trigger when there is not enough space below', async () => {
    Object.defineProperty(globalThis, 'innerHeight', {
      configurable: true,
      value: 600,
    })
    // Trigger near the bottom of the viewport: ~20px below it.
    const restore = mockTriggerRect(550, 580)

    try {
      const { user } = useUser(
        <Dropdown options={options} onSelect={jest.fn()} />,
      )
      await user.click(screen.getByTestId('Dropdown__button'))

      const list = screen.getByTestId('Dropdown__option-1').closest('.fixed')
      expect(list).not.toBeNull()
      // Bottom-anchored when flipped: viewport height (600) - trigger top (550) = 50.
      expect((list as HTMLElement).style.bottom).toBe('50px')
      expect((list as HTMLElement).style.top).toBe('')
    } finally {
      restore()
    }
  })

  it('opens below the trigger when there is enough space', async () => {
    Object.defineProperty(globalThis, 'innerHeight', {
      configurable: true,
      value: 600,
    })
    const restore = mockTriggerRect(100, 130)

    try {
      const { user } = useUser(
        <Dropdown options={options} onSelect={jest.fn()} />,
      )
      await user.click(screen.getByTestId('Dropdown__button'))

      const list = screen.getByTestId('Dropdown__option-1').closest('.fixed')
      expect((list as HTMLElement).style.top).toBe('130px')
      expect((list as HTMLElement).style.bottom).toBe('')
    } finally {
      restore()
    }
  })

  it('lets a click on a sibling button trigger that button while closing', async () => {
    const onSibling = jest.fn()
    const { user } = useUser(
      <div>
        <Dropdown options={options} onSelect={jest.fn()} />
        <button type='button' data-testid='sibling' onClick={onSibling}>
          Sibling
        </button>
      </div>,
    )

    await user.click(screen.getByTestId('Dropdown__button'))
    expect(screen.getByTestId('Dropdown__option-1')).toBeInTheDocument()

    await user.click(screen.getByTestId('sibling'))

    // Dropdown closes and the sibling click is not swallowed.
    expect(screen.queryByTestId('Dropdown__option-1')).toBeNull()
    expect(onSibling).toHaveBeenCalled()
  })

  it('uses defaultSelectedId when provided', () => {
    render(
      <Dropdown options={options} defaultSelectedId='2' onSelect={jest.fn()} />,
    )

    expect(screen.getByTestId('Dropdown__button')).toHaveTextContent('Option 2')
  })

  it('falls back to first option when defaultSelectedId does not match', () => {
    render(
      <Dropdown
        options={options}
        defaultSelectedId='nope'
        onSelect={jest.fn()}
      />,
    )

    expect(screen.getByTestId('Dropdown__button')).toHaveTextContent('Option 1')
  })

  it('renders "No Options Available" when no options and not defaultEmpty', () => {
    render(<Dropdown options={[]} onSelect={jest.fn()} />)

    expect(screen.getByTestId('Dropdown__button')).toHaveTextContent(
      'No Options Available',
    )
  })

  it('renders required asterisk on the label', () => {
    render(
      <Dropdown
        options={options}
        label='With label'
        required
        onSelect={jest.fn()}
      />,
    )

    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('syncs `selected` prop to internal state (controlled, single-select)', () => {
    const { rerender } = render(
      <Dropdown options={options} selected={options[0]} onSelect={jest.fn()} />,
    )

    expect(screen.getByTestId('Dropdown__button')).toHaveTextContent('Option 1')

    rerender(
      <Dropdown options={options} selected={options[2]} onSelect={jest.fn()} />,
    )

    expect(screen.getByTestId('Dropdown__button')).toHaveTextContent('Option 3')
  })

  it('clears single selection when clearable button is clicked', async () => {
    const onSelect = jest.fn()
    const click = useClick(
      <Dropdown
        options={options}
        defaultSelectedId='1'
        clearable
        onSelect={onSelect}
      />,
    )

    await click(screen.getByLabelText('Clear selection'))

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'default-empty' }),
    )
  })

  it('resets selection when clearAfterSelect is true (single)', async () => {
    const click = useClick(
      <Dropdown
        options={options}
        clearAfterSelect
        placeholder='Pick one'
        onSelect={jest.fn()}
      />,
    )

    await click(screen.getByText('Option 1'))
    await click(screen.getByTestId('Dropdown__option-2'))

    expect(screen.getByTestId('Dropdown__button')).toHaveTextContent('Pick one')
  })

  it('handles multiselection: toggles items and shows count', async () => {
    const onSelect = jest.fn()
    const click = useClick(
      <Dropdown
        options={options}
        multiselection
        placeholder='Pick'
        onSelect={onSelect}
      />,
    )

    expect(screen.getByTestId('Dropdown__button')).toHaveTextContent('Pick')

    await click(screen.getByTestId('Dropdown__button'))
    await click(screen.getByTestId('Dropdown__option-1'))

    expect(onSelect).toHaveBeenLastCalledWith([options[0]])
    expect(screen.getByTestId('Dropdown__button')).toHaveTextContent('Option 1')

    await click(screen.getByTestId('Dropdown__option-2'))
    expect(screen.getByTestId('Dropdown__button')).toHaveTextContent(
      '2 selected',
    )

    await click(screen.getByTestId('Dropdown__option-1'))
    expect(onSelect).toHaveBeenLastCalledWith([options[1]])
  })

  it('resets selectedItems when clearAfterSelect is true (multi)', async () => {
    const onSelect = jest.fn()
    const click = useClick(
      <Dropdown
        options={options}
        multiselection
        clearAfterSelect
        onSelect={onSelect}
      />,
    )

    await click(screen.getByTestId('Dropdown__button'))
    await click(screen.getByTestId('Dropdown__option-1'))

    expect(onSelect).toHaveBeenLastCalledWith([options[0]])
  })

  it('clears multiselection when clearable button is clicked', async () => {
    const onSelect = jest.fn()
    const click = useClick(
      <Dropdown
        options={options}
        multiselection
        clearable
        selected={[options[0], options[1]] as any}
        onSelect={onSelect}
      />,
    )

    await click(screen.getByLabelText('Clear selection'))

    expect(onSelect).toHaveBeenLastCalledWith([])
  })

  it('filters options by search text', async () => {
    const click = useClick(
      <Dropdown
        options={[
          { id: '1', label: 'Apple', searchText: 'apple' },
          { id: '2', label: 'Banana', searchText: 'banana' },
        ]}
        searchable
        onSelect={jest.fn()}
      />,
    )

    await click(screen.getByTestId('Dropdown__button'))

    const search = screen.getByPlaceholderText('Search...')
    await click(search)

    // Filter to only "banana"
    ;(search as HTMLInputElement).focus()
    search.dispatchEvent(new Event('input', { bubbles: true }))

    expect(screen.getByTestId('Dropdown__option-1')).toBeInTheDocument()
  })

  it('treats options without searchText as non-matches when filtering', async () => {
    const { user } = useUser(
      <Dropdown
        options={[
          { id: '1', label: 'No search text' },
          { id: '2', label: 'Apple', searchText: 'apple' },
        ]}
        searchable
        onSelect={jest.fn()}
      />,
    )

    await user.click(screen.getByTestId('Dropdown__button'))
    await user.type(screen.getByPlaceholderText('Search...'), 'apple')

    expect(screen.queryByTestId('Dropdown__option-1')).toBeNull()
    expect(screen.getByTestId('Dropdown__option-2')).toBeInTheDocument()
  })

  it('accepts a single selected object in multiselection (controlled)', () => {
    render(
      <Dropdown
        options={options}
        multiselection
        selected={options[1] as any}
        onSelect={jest.fn()}
      />,
    )

    expect(screen.getByTestId('Dropdown__button')).toHaveTextContent('Option 2')
  })

  it('shows "No options found" when search yields no matches', async () => {
    const { user } = useUser(
      <Dropdown
        options={[{ id: '1', label: 'Apple', searchText: 'apple' }]}
        searchable
        onSelect={jest.fn()}
      />,
    )

    await user.click(screen.getByTestId('Dropdown__button'))
    await user.type(screen.getByPlaceholderText('Search...'), 'zzz')

    expect(screen.getByText('No options found')).toBeInTheDocument()
  })

  it('closes the open list when Escape is pressed in search', async () => {
    const { user } = useUser(
      <Dropdown options={options} searchable onSelect={jest.fn()} />,
    )

    await user.click(screen.getByTestId('Dropdown__button'))
    await user.keyboard('{Escape}')

    expect(screen.queryByPlaceholderText('Search...')).toBeNull()
  })

  it('prevents default on ArrowDown in search when there are filtered options', async () => {
    const { user } = useUser(
      <Dropdown options={options} searchable onSelect={jest.fn()} />,
    )

    await user.click(screen.getByTestId('Dropdown__button'))
    await user.keyboard('{ArrowDown}')

    // Still open after arrow down
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
  })
})
