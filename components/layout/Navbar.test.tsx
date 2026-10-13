import { render, screen } from '@testing-library/react'
import { Navbar } from './Navbar'

const usePathname = vi.fn<() => string>()
vi.mock('next/navigation', () => ({ usePathname: () => usePathname() }))
vi.mock('@/lib/api/endpoints', () => ({ getMe: () => new Promise(() => {}) }))

describe('Navbar', () => {
  it('marks the link for the current route as current', () => {
    usePathname.mockReturnValue('/transactions')
    render(<Navbar />)
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(nav).toHaveTextContent('Dashboard')
    expect(nav).toHaveTextContent('Convert')
    expect(screen.getByRole('link', { name: 'Transactions' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current')
  })
})
