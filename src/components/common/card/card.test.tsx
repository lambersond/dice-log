import { Boxes } from 'lucide-react'
import { Card } from './card'
import { useUser } from '@/utils/test-utils'

describe('components/common/card', () => {
  it('renders the title and description', () => {
    const { getByText, getByRole } = useUser(
      <Card icon={Boxes} title='Billing' description='Invoicing' />,
    )
    expect(
      getByRole('heading', { level: 3, name: /billing/i }),
    ).toBeInTheDocument()
    expect(getByText('Invoicing')).toBeInTheDocument()
  })

  it('omits description paragraph when not provided', () => {
    const { queryByText } = useUser(<Card icon={Boxes} title='Billing' />)
    expect(queryByText('Invoicing')).not.toBeInTheDocument()
  })

  it('renders the title as a link when href is provided', () => {
    const { getByRole } = useUser(
      <Card icon={Boxes} title='Billing' href='/applications/a1' />,
    )
    expect(getByRole('link', { name: 'Billing' })).toHaveAttribute(
      'href',
      '/applications/a1',
    )
  })

  it('renders the title as plain text when no href is provided', () => {
    const { queryByRole, getByRole } = useUser(
      <Card icon={Boxes} title='Billing' />,
    )
    expect(queryByRole('link', { name: 'Billing' })).not.toBeInTheDocument()
    expect(
      getByRole('heading', { level: 3, name: /billing/i }),
    ).toBeInTheDocument()
  })

  it('renders the action node in the top-right slot', () => {
    const { getByText } = useUser(
      <Card icon={Boxes} title='Billing' action={<span>Member</span>} />,
    )
    expect(getByText('Member')).toBeInTheDocument()
  })

  it('renders the viewLabel hover affordance only when clickable', () => {
    const { getByText, queryByText, rerender } = useUser(
      <Card
        icon={Boxes}
        title='Billing'
        href='/a1'
        viewLabel='view application'
      />,
    )
    expect(getByText('view application')).toBeInTheDocument()

    rerender(<Card icon={Boxes} title='Billing' viewLabel='view application' />)
    expect(queryByText('view application')).not.toBeInTheDocument()
  })

  it('renders children inside the card body', () => {
    const { getByText } = useUser(
      <Card icon={Boxes} title='Billing'>
        <span>chip</span>
      </Card>,
    )
    expect(getByText('chip')).toBeInTheDocument()
  })
})
