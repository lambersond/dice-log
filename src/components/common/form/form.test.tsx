import { Form } from './form'
import { render, screen } from '@/utils/test-utils'

describe('components/common/form', () => {
  it('renders children', () => {
    render(
      <Form>
        <input data-testid='child-input' />
      </Form>,
    )

    expect(screen.getByTestId('child-input')).toBeInTheDocument()
  })

  it('forwards form props (e.g. onSubmit) to the underlying form element', () => {
    const onSubmit = jest.fn(e => e.preventDefault())
    const { container } = render(
      <Form onSubmit={onSubmit}>
        <button type='submit'>Submit</button>
      </Form>,
    )

    container
      .querySelector('form')
      ?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})
