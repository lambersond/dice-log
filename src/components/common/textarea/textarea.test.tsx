import { TextArea } from './textarea'
import { render, screen } from '@/utils/test-utils'

describe('components/common/textarea', () => {
  it('should render with required and label', () => {
    render(<TextArea required label='LABEL' />)

    expect(screen.getByText('LABEL')).toBeInTheDocument()
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('forwards name to the underlying textarea', () => {
    render(<TextArea name='item' label='test' />)

    expect(screen.getByLabelText('test')).toHaveAttribute('name', 'item')
  })
})
