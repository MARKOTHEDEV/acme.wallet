import { render, screen } from '@testing-library/react'
import { Input } from './Input'

describe('Input', () => {
  it('is labelled by its label', () => {
    render(<Input label="Amount" placeholder="0.00" />)
    expect(screen.getByLabelText('Amount')).toHaveAttribute('placeholder', '0.00')
  })

  it('describes itself with the hint, or the error when there is one', () => {
    const { rerender } = render(<Input label="Amount" hint="Balance: $10.00" />)
    expect(screen.getByLabelText('Amount')).toHaveAccessibleDescription('Balance: $10.00')

    rerender(<Input label="Amount" hint="Balance: $10.00" error="Enter a positive amount" />)
    const input = screen.getByLabelText('Amount')
    expect(input).toHaveAccessibleDescription('Enter a positive amount')
    expect(input).toBeInvalid()
  })
})
