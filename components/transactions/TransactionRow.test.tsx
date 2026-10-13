import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Transaction } from '@/types/api'
import { TransactionRow } from './TransactionRow'

const base: Transaction = {
  id: 'txn_1',
  reference: 'ACM-1',
  type: 'card_payment',
  status: 'successful',
  currency: 'USD',
  amount: 1549,
  fee: 0,
  narration: 'Card payment - Netflix',
  counterparty: null,
  createdAt: '2026-10-13T14:22:00.000Z',
}

describe('TransactionRow', () => {
  it('renders upstream narration as text, never as HTML', () => {
    const payload = `Bill payment - Spectranet <img src="x" onerror="console.warn('narration rendered as HTML')">`
    const { container } = render(<TransactionRow transaction={{ ...base, narration: payload }} />)
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByText(payload)).toBeInTheDocument()
  })

  it('shows a debit with its sign, the status badge and no fee', () => {
    render(<TransactionRow transaction={{ ...base, fee: 223 }} />)
    expect(screen.getByText('-$15.49')).toBeInTheDocument()
    expect(screen.getByText('Successful')).toBeInTheDocument()
    expect(screen.queryByText(/fee/i)).not.toBeInTheDocument()
  })

  it('shows credits in green with a plus sign', () => {
    render(
      <TransactionRow
        transaction={{
          ...base,
          type: 'transfer_in',
          currency: 'NGN',
          amount: 2500000,
          counterparty: 'Ada Okafor',
        }}
      />
    )
    expect(screen.getByText('+₦25,000.00')).toHaveClass('credit')
  })

  it('uses the counterparty initials for transfers and an icon otherwise', () => {
    const { container, rerender } = render(
      <TransactionRow transaction={{ ...base, type: 'transfer_out', counterparty: 'Kwame Mensah' }} />
    )
    expect(screen.getByText('KM')).toBeInTheDocument()
    expect(container.querySelector('svg')).toBeNull()

    rerender(<TransactionRow transaction={base} />)
    expect(screen.queryByText('KM')).not.toBeInTheDocument()
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('hands the transaction to onSelect when activated', async () => {
    const onSelect = vi.fn()
    render(<TransactionRow transaction={base} onSelect={onSelect} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onSelect).toHaveBeenCalledWith(base)
  })
})
