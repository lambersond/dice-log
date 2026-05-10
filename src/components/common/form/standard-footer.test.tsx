import { StandardFooter } from './standard-footer'
import { render, screen, useUser } from '@/utils/test-utils'

describe('components/common/form/standard-footer', () => {
  it('renders default cancel and submit text', () => {
    render(<StandardFooter onCancel={jest.fn()} />)

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('renders custom button text', () => {
    render(
      <StandardFooter
        onCancel={jest.fn()}
        cancelText='Nevermind'
        submitText='Create'
      />,
    )

    expect(
      screen.getByRole('button', { name: 'Nevermind' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
  })

  it('calls onCancel when the cancel button is clicked', async () => {
    const onCancel = jest.fn()
    const { user } = useUser(<StandardFooter onCancel={onCancel} />)

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('shows submittingText and disables submit when submitting', () => {
    render(
      <StandardFooter
        onCancel={jest.fn()}
        submitting
        submittingText='Working…'
      />,
    )

    const submit = screen.getByRole('button', { name: 'Working…' })
    expect(submit).toBeDisabled()
  })

  it('disables submit when disableSubmit is true', () => {
    render(<StandardFooter onCancel={jest.fn()} disableSubmit />)

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('uses correct button types', () => {
    render(<StandardFooter onCancel={jest.fn()} />)

    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveAttribute(
      'type',
      'button',
    )
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute(
      'type',
      'submit',
    )
  })
})
