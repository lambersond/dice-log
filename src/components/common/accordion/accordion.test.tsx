import { Accordion } from './accordion'
import { useUser } from '@/utils/test-utils'

describe('components/common/accordion', () => {
  it('renders the title in both the toggle button and the static md+ heading', () => {
    const { getByRole, getAllByText } = useUser(
      <Accordion title='Settings'>content</Accordion>,
    )
    expect(getByRole('button', { name: /settings/i })).toBeInTheDocument()
    expect(getAllByText('Settings')).toHaveLength(2)
  })

  it('starts collapsed by default and toggles open on click', async () => {
    const { getByRole, user } = useUser(
      <Accordion title='Settings'>content</Accordion>,
    )
    const toggle = getByRole('button', { name: /settings/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await user.click(toggle)

    expect(toggle).toHaveAttribute('aria-expanded', 'true')
  })

  it('respects defaultOpen', () => {
    const { getByRole } = useUser(
      <Accordion title='Settings' defaultOpen>
        content
      </Accordion>,
    )
    expect(getByRole('button', { name: /settings/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('exposes a region labelled by the heading and controlled by the toggle', () => {
    const { getByRole } = useUser(
      <Accordion title='Settings' defaultOpen>
        content
      </Accordion>,
    )
    const region = getByRole('region', { name: /settings/i })
    const toggle = getByRole('button', { name: /settings/i })
    expect(toggle.getAttribute('aria-controls')).toBe(region.getAttribute('id'))
  })

  it('always renders the children in the DOM (md:block keeps them visible)', () => {
    const { getByText } = useUser(
      <Accordion title='Settings'>
        <span>panel-body</span>
      </Accordion>,
    )
    // children remain in the DOM regardless of isOpen — visibility is CSS-only
    expect(getByText('panel-body')).toBeInTheDocument()
  })
})
