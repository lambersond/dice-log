import { Plus } from 'lucide-react'
import { Button } from './button'
import { render, screen, useUser } from '@/utils/test-utils'

describe('components/common/buttons/button', () => {
  it('renders the label and forwards onClick', async () => {
    const onClick = jest.fn()
    const { user } = useUser(<Button onClick={onClick}>Save</Button>)

    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders the icon to the left of the label when provided', () => {
    render(<Button icon={Plus}>Add product</Button>)
    const button = screen.getByRole('button', { name: /add product/i })
    expect(button.querySelector('svg')).toBeInTheDocument()
    expect(button).toHaveTextContent('Add product')
  })

  it('uses a custom dataTestId', () => {
    render(<Button dataTestId='save-btn'>Save</Button>)
    expect(screen.getByTestId('save-btn')).toBeInTheDocument()
  })

  it('renders inside a Tooltip when tooltip prop is set', async () => {
    const { user } = useUser(<Button tooltip='Save changes'>Save</Button>)

    await user.hover(screen.getByRole('button'))

    expect(await screen.findByText('Save changes')).toBeInTheDocument()
  })

  it('defaults to type="button" to prevent accidental form submits', () => {
    render(<Button>Save</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('respects an explicit type="submit"', () => {
    render(<Button type='submit'>Save</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  it.each(['sm', 'md', 'lg', 'xl'] as const)('renders the %s size', size => {
    render(
      <Button size={size} dataTestId={`s-${size}`}>
        Hi
      </Button>,
    )
    expect(screen.getByTestId(`s-${size}`).className).toMatch(/rounded-/)
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
  ] as const)('renders the %s intent (filled)', intent => {
    render(<Button intent={intent}>Hi</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  describe('variant', () => {
    it('uses a filled background for variant="filled" (default)', () => {
      render(<Button intent='primary'>Save</Button>)
      const tokens = screen.getByRole('button').className.split(' ')
      expect(tokens).toContain('bg-primary')
      expect(tokens).toContain('text-white')
    })

    it('uses a border but no fill for variant="outline"', () => {
      render(
        <Button intent='primary' variant='outline'>
          Save
        </Button>,
      )
      const tokens = screen.getByRole('button').className.split(' ')
      expect(tokens).toContain('border-primary')
      expect(tokens).toContain('text-primary')
      expect(tokens).not.toContain('bg-primary')
    })

    it('uses a transparent background for variant="ghost"', () => {
      render(
        <Button intent='primary' variant='ghost'>
          Save
        </Button>,
      )
      const tokens = screen.getByRole('button').className.split(' ')
      expect(tokens).toContain('text-primary')
      expect(tokens).not.toContain('bg-primary')
      expect(tokens).not.toContain('border-primary')
    })
  })

  it('applies custom className', () => {
    render(
      <Button className='my-extra' dataTestId='custom'>
        Hi
      </Button>,
    )
    expect(screen.getByTestId('custom').className).toContain('my-extra')
  })

  it('forwards aria-label and disabled to the button element', () => {
    render(
      <Button aria-label='Submit form' disabled>
        Save
      </Button>,
    )
    const button = screen.getByRole('button', { name: /submit form/i })
    expect(button).toBeDisabled()
  })
})
