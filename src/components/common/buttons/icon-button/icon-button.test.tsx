import { Check, Pencil } from 'lucide-react'
import { IconButton } from './icon-button'
import { render, screen, useUser, waitFor } from '@/utils/test-utils'

describe('components/common/buttons/icon-button', () => {
  it('renders without a tooltip and forwards onClick', async () => {
    const onClick = jest.fn()
    const { user } = useUser(<IconButton icon={Pencil} onClick={onClick} />)

    await user.click(screen.getByTestId('icon-button'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('uses a custom dataTestId', () => {
    render(<IconButton icon={Pencil} dataTestId='edit-btn' />)

    expect(screen.getByTestId('edit-btn')).toBeInTheDocument()
  })

  it('renders inside a Tooltip when tooltip prop is set', async () => {
    const { user } = useUser(<IconButton icon={Pencil} tooltip='Edit me' />)

    await user.hover(screen.getByTestId('icon-button'))

    expect(await screen.findByText('Edit me')).toBeInTheDocument()
  })

  it('swaps to actionIcon when loaded then returns to idle (tooltip + onClick)', async () => {
    const onClick = jest.fn()
    const { container, user } = useUser(
      <IconButton
        icon={Pencil}
        actionIcon={Check}
        onClick={onClick}
        tooltip='Save'
      />,
    )

    expect(container.querySelector('.lucide-pencil')).toBeInTheDocument()

    await user.click(screen.getByTestId('icon-button'))

    expect(onClick).toHaveBeenCalledTimes(1)
    await waitFor(() =>
      expect(container.querySelector('.lucide-check')).toBeInTheDocument(),
    )

    await waitFor(
      () =>
        expect(container.querySelector('.lucide-pencil')).toBeInTheDocument(),
      { timeout: 2000 },
    )
  })

  it.each(['sm', 'md', 'lg', 'xl'] as const)('renders the %s size', size => {
    const { container } = render(
      <IconButton icon={Pencil} size={size} dataTestId={`s-${size}`} />,
    )
    const svg = container.querySelector('svg')

    expect(svg?.className.baseVal).toMatch(/size-/)
  })

  it.each([
    'primary',
    'normal',
    'success',
    'warning',
    'danger',
    'info',
    'text-primary',
    'text-secondary',
  ] as const)('renders the %s intent', intent => {
    render(<IconButton icon={Pencil} intent={intent} dataTestId='ib' />)

    expect(screen.getByTestId('ib')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <IconButton icon={Pencil} className='my-extra' dataTestId='custom' />,
    )

    expect(screen.getByTestId('custom').className).toContain('my-extra')
  })

  it('forwards aria-label to the button element', () => {
    render(<IconButton icon={Pencil} aria-label='Edit thing' />)
    expect(
      screen.getByRole('button', { name: /edit thing/i }),
    ).toBeInTheDocument()
  })

  describe('text', () => {
    it('renders the text to the right of the icon', () => {
      render(<IconButton icon={Pencil} text='Edit' />)
      const btn = screen.getByTestId('icon-button')
      expect(btn).toHaveTextContent('Edit')
    })

    it('uses the size-matched border radius when text is set', () => {
      const { rerender } = render(
        <IconButton icon={Pencil} text='Edit' size='sm' />,
      )
      expect(screen.getByTestId('icon-button').className).toContain(
        'rounded-sm',
      )

      rerender(<IconButton icon={Pencil} text='Edit' size='lg' />)
      expect(screen.getByTestId('icon-button').className).toContain(
        'rounded-lg',
      )
    })

    it('falls back to the default rounded class when no text is set', () => {
      render(<IconButton icon={Pencil} size='lg' />)
      const className = screen.getByTestId('icon-button').className
      expect(className).toContain('rounded')
      expect(className).not.toContain('rounded-lg')
    })
  })

  describe('border', () => {
    it('does not include a border by default', () => {
      render(<IconButton icon={Pencil} intent='primary' />)
      expect(screen.getByTestId('icon-button').className).not.toContain(
        'border-primary',
      )
    })

    it.each([
      ['primary', 'border-primary'],
      ['danger', 'border-danger'],
      ['text-primary', 'border-text-primary'],
    ] as const)(
      'applies a matching %s border when border={true}',
      (intent, expectedClass) => {
        render(
          <IconButton icon={Pencil} intent={intent} border dataTestId='b' />,
        )
        expect(screen.getByTestId('b').className).toContain(expectedClass)
      },
    )
  })
})
