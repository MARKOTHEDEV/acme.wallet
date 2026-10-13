import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Select } from './Select'

const OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'successful', label: 'Successful' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
]

function renderSelect(value = '') {
  const onChange = vi.fn()
  render(
    <>
      <Select label="Status" options={OPTIONS} value={value} onChange={onChange} />
      <button type="button">Elsewhere</button>
    </>
  )
  return { onChange, trigger: screen.getByRole('combobox', { name: 'Status' }) }
}

describe('Select', () => {
  it('shows the selected label and opens a listbox marking the current option', async () => {
    const { trigger } = renderSelect('pending')
    expect(trigger).toHaveTextContent('Pending')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(4)
    expect(screen.getByRole('option', { name: 'Pending' })).toHaveAttribute('aria-selected', 'true')
  })

  it('reports a click on an option, closes and keeps focus on the trigger', async () => {
    const { onChange, trigger } = renderSelect()
    await userEvent.click(trigger)
    await userEvent.click(screen.getByRole('option', { name: 'Failed' }))
    expect(onChange).toHaveBeenCalledWith('failed')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('is fully keyboard operable', async () => {
    const { onChange, trigger } = renderSelect('successful')
    trigger.focus()
    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(trigger).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Successful' }).id
    )

    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    expect(trigger).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Failed' }).id
    )

    await userEvent.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledWith('failed')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('closes on Escape without changing, and on a click outside', async () => {
    const { onChange, trigger } = renderSelect()
    await userEvent.click(trigger)
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()

    await userEvent.click(trigger)
    await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('jumps to an option by its first letter while open', async () => {
    const { trigger } = renderSelect()
    trigger.focus()
    await userEvent.keyboard('{ArrowDown}p')
    expect(trigger).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Pending' }).id
    )
  })
})
