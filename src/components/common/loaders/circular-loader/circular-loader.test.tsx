import { CircularLoader } from './circular-loader'
import { render, screen } from '@/utils/test-utils'

describe('components/common/loaders/circular-loader', () => {
  it('renders the default label', () => {
    render(<CircularLoader />)

    expect(screen.getAllByText('Loading…').length).toBeGreaterThan(0)
  })

  it('renders a custom label', () => {
    render(<CircularLoader label='Working' />)

    expect(screen.getAllByText('Working').length).toBeGreaterThan(0)
  })

  it('hides the visible label when label is empty but keeps the spinner', () => {
    const { container } = render(<CircularLoader label='' />)

    expect(container.querySelector('p')).not.toBeInTheDocument()
    expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument()
  })

  it.each(['sm', 'md', 'lg'] as const)('applies the %s size classes', size => {
    const { container } = render(<CircularLoader size={size} />)
    const spinner = container.querySelector('[aria-live="polite"]')

    expect(spinner?.className).toMatch(/border/)
  })

  it('renders fullscreen overlay when fullscreen is true', () => {
    const { container } = render(<CircularLoader fullscreen />)

    expect(container.querySelector('.fixed.inset-0')).toBeInTheDocument()
  })

  it('renders inline (no overlay) by default', () => {
    const { container } = render(<CircularLoader />)

    expect(container.querySelector('.fixed.inset-0')).not.toBeInTheDocument()
  })
})
