import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { pageItems, Pagination } from './Pagination'

describe('pageItems', () => {
  it('shows the first pages and the last with one gap, like the design', () => {
    expect(pageItems(1, 12)).toEqual([1, 2, 3, '…', 12])
  })

  it('keeps the current page with its neighbours and collapses both sides', () => {
    expect(pageItems(6, 12)).toEqual([1, '…', 5, 6, 7, '…', 12])
    expect(pageItems(12, 12)).toEqual([1, '…', 10, 11, 12])
  })

  it('never inserts a gap for a single missing page or small totals', () => {
    expect(pageItems(3, 5)).toEqual([1, 2, 3, 4, 5])
    expect(pageItems(2, 4)).toEqual([1, 2, 3, 4])
    expect(pageItems(1, 1)).toEqual([1])
  })
})

describe('Pagination', () => {
  it('summarises the range, marks the current page and disables the edges', async () => {
    const onPageChange = vi.fn()
    render(<Pagination page={1} totalPages={12} total={237} pageSize={20} onPageChange={onPageChange} />)
    expect(screen.getByText('Showing 1–20 of 237')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(onPageChange).toHaveBeenCalledWith(2)
    await userEvent.click(screen.getByRole('button', { name: 'Page 12' }))
    expect(onPageChange).toHaveBeenCalledWith(12)
  })

  it('clips the last range to the total', () => {
    render(<Pagination page={12} totalPages={12} total={237} pageSize={20} onPageChange={vi.fn()} />)
    expect(screen.getByText('Showing 221–237 of 237')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })
})
