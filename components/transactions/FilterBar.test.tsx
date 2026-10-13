import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterBar, SEARCH_DEBOUNCE_MS } from './FilterBar'

function renderBar(props: Partial<React.ComponentProps<typeof FilterBar>> = {}) {
  const handlers = {
    onSearch: vi.fn(),
    onTypeChange: vi.fn(),
    onStatusChange: vi.fn(),
    onClear: vi.fn(),
  }
  const utils = render(<FilterBar q="" {...handlers} {...props} />)
  return { ...utils, ...handlers }
}

describe('FilterBar', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('waits for a pause in typing before searching, and trims the term', () => {
    vi.useFakeTimers()
    const { onSearch } = renderBar()
    const input = screen.getByLabelText('Search')

    fireEvent.change(input, { target: { value: ' ne' } })
    act(() => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 50)
    })
    fireEvent.change(input, { target: { value: ' net ' } })
    act(() => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 50)
    })
    expect(onSearch).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(50)
    })
    expect(onSearch).toHaveBeenCalledTimes(1)
    expect(onSearch).toHaveBeenCalledWith('net')
  })

  it('reports select changes immediately, with undefined for "All"', async () => {
    const { onTypeChange, onStatusChange } = renderBar({ status: 'failed' })
    await userEvent.click(screen.getByRole('combobox', { name: 'Type' }))
    await userEvent.click(screen.getByRole('option', { name: 'Card payment' }))
    expect(onTypeChange).toHaveBeenCalledWith('card_payment')

    await userEvent.click(screen.getByRole('combobox', { name: 'Status' }))
    await userEvent.click(screen.getByRole('option', { name: 'All statuses' }))
    expect(onStatusChange).toHaveBeenCalledWith(undefined)
  })

  it('shows Clear filters only when something is set', () => {
    const { rerender, onClear } = renderBar()
    expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument()

    rerender(
      <FilterBar
        q=""
        status="failed"
        onSearch={vi.fn()}
        onTypeChange={vi.fn()}
        onStatusChange={vi.fn()}
        onClear={onClear}
      />
    )
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument()
  })

  it('adopts a search term that changes from outside, such as Back', () => {
    const { rerender } = renderBar({ q: 'ada' })
    expect(screen.getByLabelText('Search')).toHaveValue('ada')
    rerender(
      <FilterBar q="" onSearch={vi.fn()} onTypeChange={vi.fn()} onStatusChange={vi.fn()} onClear={vi.fn()} />
    )
    expect(screen.getByLabelText('Search')).toHaveValue('')
  })
})
