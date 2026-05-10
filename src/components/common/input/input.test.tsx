import { Input } from './input'
import { render, screen } from '@/utils/test-utils'

describe('components/common/input', () => {
  it('should render with required and label', () => {
    render(<Input required label='LABEL' />)

    expect(screen.getByText('LABEL')).toBeInTheDocument()
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('should render with error', () => {
    render(<Input error='ERROR' />)

    expect(screen.getByText('ERROR')).toHaveClass('text-danger')
  })

  it('forwards name to the underlying input', () => {
    render(<Input name='item' label='test' />)

    expect(screen.getByLabelText('test')).toHaveAttribute('name', 'item')
  })
})
