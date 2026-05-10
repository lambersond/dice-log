import { D10Icon } from './d10'
import { D12Icon } from './d12'
import { D20Icon } from './d20'
import { D4Icon } from './d4'
import { D6Icon } from './d6'
import { D8Icon } from './d8'
import { MoreVertIcon } from './more-vert'
import { render, screen } from '@/utils/test-utils'

describe('components/common/icons', () => {
  it.each([
    ['D4Icon', <D4Icon key='d4' />],
    ['D6Icon', <D6Icon key='d6' />],
    ['D8Icon', <D8Icon key='d8' />],
    ['D10Icon', <D10Icon key='d10' />],
    ['D12Icon', <D12Icon key='d12' />],
    ['D20Icon', <D20Icon key='d20' />],
    ['MoreVertIcon', <MoreVertIcon key='more' />],
  ])('renders %s with the matching data-testid', (testId, element) => {
    render(element)

    expect(screen.getByTestId(testId)).toBeInTheDocument()
  })

  it('forwards SVG props to the underlying svg element', () => {
    render(<D20Icon className='text-danger' aria-label='d20' />)

    const svg = screen.getByTestId('D20Icon')
    expect(svg).toHaveClass('text-danger')
    expect(svg).toHaveAttribute('aria-label', 'd20')
  })

  it('uses a custom viewBox for D20Icon and the default for MoreVertIcon', () => {
    const { rerender } = render(<D20Icon />)
    expect(screen.getByTestId('D20Icon')).toHaveAttribute(
      'viewBox',
      '0 0 100 100',
    )

    rerender(<MoreVertIcon />)
    expect(screen.getByTestId('MoreVertIcon')).toHaveAttribute(
      'viewBox',
      '0 0 24 24',
    )
  })

  it('renders a path with currentColor fill', () => {
    const { container } = render(<MoreVertIcon />)

    const path = container.querySelector('path')
    expect(path).toHaveAttribute('fill', 'currentColor')
    expect(path?.getAttribute('d')).toBeTruthy()
  })
})
