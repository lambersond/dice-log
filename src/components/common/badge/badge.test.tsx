import { Badge } from './badge'
import { render, screen } from '@/utils/test-utils'

describe('components/common/badge', () => {
  it('should match the snapshot', () => {
    expect(render(<Badge text='hello' />).asFragment()).toMatchSnapshot()
  })

  it('should render the provided text', () => {
    render(<Badge text='New' />)

    expect(screen.getByText('New')).toBeInTheDocument()
  })
})
