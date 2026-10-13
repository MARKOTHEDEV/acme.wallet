import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RecentTransactions } from './RecentTransactions'

const getTransactions = vi.fn()
vi.mock('@/lib/api/endpoints', () => ({
  getTransactions: () => getTransactions(),
  getTransaction: () => new Promise(() => {}),
}))

const tx = {
  id: 'txn_1',
  reference: 'ACM-1',
  type: 'deposit' as const,
  status: 'successful' as const,
  currency: 'NGN' as const,
  amount: 50000,
  fee: 0,
  narration: 'Wallet top-up via bank transfer',
  counterparty: null,
  createdAt: '2026-10-13T09:00:00.000Z',
}

describe('RecentTransactions', () => {
  beforeEach(() => {
    getTransactions.mockReset()
  })

  it('shows a skeleton while loading', () => {
    getTransactions.mockReturnValue(new Promise(() => {}))
    render(<RecentTransactions onOpen={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('status', { name: 'Loading transactions' })).toBeInTheDocument()
  })

  it('offers a retry when the list cannot be loaded, instead of pretending it is empty', async () => {
    getTransactions.mockImplementation(() => Promise.reject(new Error('Something went wrong')))
    render(<RecentTransactions onOpen={vi.fn()} onClose={vi.fn()} />)
    expect(await screen.findByText("We couldn't load your transactions")).toBeInTheDocument()
    expect(screen.queryByText('No transactions yet')).not.toBeInTheDocument()

    getTransactions.mockResolvedValue({ data: [] })
    await userEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(await screen.findByText('No transactions yet')).toBeInTheDocument()
  })

  it('reports the clicked row and shows it in the drawer when it is the open one', async () => {
    getTransactions.mockResolvedValue({ data: [tx] })
    const onOpen = vi.fn()
    const { rerender } = render(<RecentTransactions onOpen={onOpen} onClose={vi.fn()} />)
    await userEvent.click(await screen.findByRole('button', { name: /wallet top-up/i }))
    expect(onOpen).toHaveBeenCalledWith('txn_1')

    rerender(<RecentTransactions openId="txn_1" onOpen={onOpen} onClose={vi.fn()} />)
    expect(screen.getByRole('dialog', { name: 'Transaction details' })).toBeInTheDocument()
    expect(screen.getByText('ACM-1')).toBeInTheDocument()
  })
})
