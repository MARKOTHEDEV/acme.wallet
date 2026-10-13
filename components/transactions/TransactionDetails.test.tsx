import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Transaction } from '@/types/api'
import { TransactionDetails } from './TransactionDetails'

const transfer: Transaction = {
  id: 'txn_1',
  reference: 'ACM-48213377',
  type: 'transfer_out',
  status: 'successful',
  currency: 'GHS',
  amount: 120000,
  fee: 1200,
  narration: 'Transfer to Kwame Mensah',
  counterparty: 'Kwame Mensah',
  createdAt: '2026-10-05T10:15:00.000Z',
}

describe('TransactionDetails', () => {
  it('shows the hero, details and a summary whose total adds the fee', () => {
    render(<TransactionDetails transaction={transfer} />)
    expect(screen.getByText('KM')).toBeInTheDocument()
    expect(screen.getByText('Transfer out to Kwame Mensah')).toBeInTheDocument()
    expect(screen.getByText('-GH₵1,200.00')).toBeInTheDocument()
    expect(screen.getByText('Successful')).toBeInTheDocument()
    expect(screen.getByText('ACM-48213377')).toBeInTheDocument()
    expect(screen.getByText('Transfer out')).toBeInTheDocument()
    expect(screen.getByText('Kwame Mensah')).toBeInTheDocument()
    expect(screen.getByText('GH₵12.00')).toBeInTheDocument()
    expect(screen.getByText('GH₵1,212.00')).toBeInTheDocument()
  })

  it('omits the counterparty row and describes other types by their narration', () => {
    render(
      <TransactionDetails
        transaction={{
          ...transfer,
          type: 'card_payment',
          counterparty: null,
          narration: 'Card payment - Netflix',
        }}
      />
    )
    expect(screen.queryByText('Counterparty')).not.toBeInTheDocument()
    expect(screen.getAllByText('Card payment - Netflix')).toHaveLength(2)
  })

  it('copies the reference to the clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    render(<TransactionDetails transaction={transfer} />)
    await userEvent.click(screen.getByRole('button', { name: 'Copy reference' }))
    expect(writeText).toHaveBeenCalledWith('ACM-48213377')
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument()
  })
})
