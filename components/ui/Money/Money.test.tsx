import { render, screen } from '@testing-library/react'
import { Money } from './Money'

describe('Money', () => {
  it('always shows two decimals', () => {
    render(<Money amount={100000} currency="NGN" />)
    expect(screen.getByText('₦1,000.00')).toBeInTheDocument()
  })

  it('formats very large amounts without losing precision', () => {
    render(<Money amount={2_499_999_999_99} currency="NGN" />)
    expect(screen.getByText('₦2,499,999,999.99')).toBeInTheDocument()
  })

  it('prefixes credits and debits with a sign', () => {
    const { rerender } = render(<Money amount={4599} currency="USD" sign="credit" />)
    expect(screen.getByText('+$45.99')).toBeInTheDocument()
    rerender(<Money amount={4599} currency="USD" sign="debit" />)
    expect(screen.getByText('-$45.99')).toBeInTheDocument()
  })
})
