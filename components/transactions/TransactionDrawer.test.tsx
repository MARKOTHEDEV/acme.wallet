import { act, render, screen } from '@testing-library/react'
import type { Transaction } from '@/types/api'
import { ApiError } from '@/lib/api/client'
import { TransactionDrawer } from './TransactionDrawer'

const getTransaction = vi.fn()
vi.mock('@/lib/api/endpoints', () => ({ getTransaction: (id: string) => getTransaction(id) }))

const tx: Transaction = {
  id: 'txn_1',
  reference: 'ACM-1',
  type: 'deposit',
  status: 'successful',
  currency: 'NGN',
  amount: 50000,
  fee: 0,
  narration: 'Wallet top-up via bank transfer',
  counterparty: null,
  createdAt: '2026-10-13T09:00:00.000Z',
}

describe('TransactionDrawer', () => {
  beforeEach(() => {
    getTransaction.mockReset()
  })

  it('stays closed without an id', () => {
    render(<TransactionDrawer transactions={[tx]} onClose={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows a transaction from the page without fetching', () => {
    render(<TransactionDrawer id="txn_1" transactions={[tx]} onClose={vi.fn()} />)
    expect(screen.getByRole('dialog', { name: 'Transaction details' })).toBeInTheDocument()
    expect(screen.getByText('ACM-1')).toBeInTheDocument()
    expect(getTransaction).not.toHaveBeenCalled()
  })

  it('fetches a transaction that is not on the page, showing a skeleton meanwhile', async () => {
    getTransaction.mockResolvedValue({ data: { ...tx, id: 'txn_9', reference: 'ACM-9' } })
    render(<TransactionDrawer id="txn_9" transactions={[tx]} onClose={vi.fn()} />)
    expect(screen.getByRole('status', { name: 'Loading transaction' })).toBeInTheDocument()
    expect(await screen.findByText('ACM-9')).toBeInTheDocument()
    expect(getTransaction).toHaveBeenCalledWith('txn_9')
  })

  it('shows the not-found state for a bad link', async () => {
    getTransaction.mockImplementation(() =>
      Promise.reject(new ApiError(404, 'NOT_FOUND', 'Transaction nope not found'))
    )
    render(<TransactionDrawer id="nope" transactions={[]} onClose={vi.fn()} />)
    // Let the rejected request settle inside React's act scope.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })
    expect(screen.getByText('Transaction not found')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back to transactions' })).toBeInTheDocument()
  })
})
