import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RecentTransactions } from './RecentTransactions'

const getTransactions = vi.fn()
vi.mock('@/lib/api/endpoints', () => ({ getTransactions: () => getTransactions() }))

describe('RecentTransactions', () => {
  beforeEach(() => {
    getTransactions.mockReset()
  })

  it('shows a skeleton while loading', () => {
    getTransactions.mockReturnValue(new Promise(() => {}))
    render(<RecentTransactions />)
    expect(screen.getByRole('status', { name: 'Loading transactions' })).toBeInTheDocument()
  })

  it('offers a retry when the list cannot be loaded, instead of pretending it is empty', async () => {
    getTransactions.mockImplementation(() => Promise.reject(new Error('Something went wrong')))
    render(<RecentTransactions />)
    expect(await screen.findByText("We couldn't load your transactions")).toBeInTheDocument()
    expect(screen.queryByText('No transactions yet')).not.toBeInTheDocument()

    getTransactions.mockResolvedValue({ data: [] })
    await userEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(await screen.findByText('No transactions yet')).toBeInTheDocument()
  })
})
