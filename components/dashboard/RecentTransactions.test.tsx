import { render, screen } from '@testing-library/react'
import { RecentTransactions } from './RecentTransactions'

const getTransactions = vi.fn()
vi.mock('@/lib/api/endpoints', () => ({ getTransactions: () => getTransactions() }))

describe('RecentTransactions', () => {
  it('tells the user when the list cannot be loaded instead of pretending it is empty', async () => {
    getTransactions.mockRejectedValue(new Error('Something went wrong'))
    render(<RecentTransactions />)
    expect(await screen.findByText("We couldn't load your transactions.")).toBeInTheDocument()
    expect(screen.queryByText('No transactions yet.')).not.toBeInTheDocument()
  })

  it('shows the empty message only for a genuinely empty list', async () => {
    getTransactions.mockResolvedValue({ data: [] })
    render(<RecentTransactions />)
    expect(await screen.findByText('No transactions yet.')).toBeInTheDocument()
  })
})
