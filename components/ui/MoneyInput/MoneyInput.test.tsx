import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { MoneyInput } from './MoneyInput'

function Harness() {
  const [value, setValue] = useState('')
  return <MoneyInput label="Amount" value={value} onValueChange={setValue} />
}

describe('MoneyInput', () => {
  it('formats with separators as the user types and uses a decimal keypad', () => {
    render(<Harness />)
    const input = screen.getByLabelText('Amount') as HTMLInputElement
    expect(input).toHaveAttribute('inputmode', 'decimal')
    fireEvent.change(input, { target: { value: '1000000.5' } })
    expect(input.value).toBe('1,000,000.5')
  })

  it('keeps the caret in place when a separator is inserted before it', () => {
    render(<Harness />)
    const input = screen.getByLabelText('Amount') as HTMLInputElement
    fireEvent.change(input, { target: { value: '1,234' } })
    // Type a "5" after the "2": "1,25|34" -> formatted "12,5|34"
    fireEvent.change(input, { target: { value: '1,2534', selectionStart: 4, selectionEnd: 4 } })
    expect(input.value).toBe('12,534')
    expect(input.selectionStart).toBe(4)
  })
})
