import { render, screen } from '@testing-library/react'
import { Select } from './Select'

const OPTIONS = [
  { value: 'NGN', label: 'NGN' },
  { value: 'USD', label: 'USD' },
]

describe('Select', () => {
  it('is labelled by its label', () => {
    render(<Select label="From" options={OPTIONS} defaultValue="USD" />)
    expect(screen.getByLabelText('From')).toHaveValue('USD')
  })
})
