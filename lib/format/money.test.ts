import { formatAmountInput, formatMoney, parseMoney } from './money'

describe('formatMoney', () => {
  it('formats minor units with two decimals', () => {
    expect(formatMoney(150050, 'NGN')).toBe('₦1,500.50')
    expect(formatMoney(85020, 'GHS')).toBe('GH₵850.20')
    expect(formatMoney(4599, 'USD')).toBe('$45.99')
  })

  it('can always show the sign', () => {
    expect(formatMoney(-4599, 'USD', { signDisplay: 'always' })).toBe('-$45.99')
    expect(formatMoney(2500000, 'NGN', { signDisplay: 'always' })).toBe('+₦25,000.00')
  })
})

describe('parseMoney', () => {
  it('parses decimal input into minor units without float error', () => {
    expect(parseMoney('19.99', 'USD')).toBe(1999)
    expect(parseMoney('1,500.5', 'NGN')).toBe(150050)
    expect(parseMoney('7', 'GHS')).toBe(700)
  })

  it('rejects invalid input', () => {
    expect(parseMoney('', 'NGN')).toBeNull()
    expect(parseMoney('1.234', 'NGN')).toBeNull()
    expect(parseMoney('abc', 'NGN')).toBeNull()
  })
})

describe('formatAmountInput', () => {
  it('groups thousands while typing', () => {
    expect(formatAmountInput('1000000')).toBe('1,000,000')
    expect(formatAmountInput('1,0000')).toBe('10,000')
    expect(formatAmountInput('1500.5')).toBe('1,500.5')
  })

  it('allows one decimal point and two decimals, and drops anything else', () => {
    expect(formatAmountInput('12.345')).toBe('12.34')
    expect(formatAmountInput('1.2.3')).toBe('1.23')
    expect(formatAmountInput('abc1x2')).toBe('12')
    expect(formatAmountInput('.5')).toBe('0.5')
    expect(formatAmountInput('007')).toBe('7')
    expect(formatAmountInput('')).toBe('')
  })

  it('produces values parseMoney accepts', () => {
    expect(parseMoney(formatAmountInput('1234567.891'), 'NGN')).toBe(123456789)
  })
})
