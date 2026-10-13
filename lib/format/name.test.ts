import { initials } from './name'

describe('initials', () => {
  it('takes the first letter of the first two words', () => {
    expect(initials('Ada Okafor')).toBe('AO')
    expect(initials('Kwame Mensah')).toBe('KM')
  })

  it('treats hyphenated names as separate words and ignores symbols', () => {
    expect(initials('Okonkwo-Adeyemi Logistics & Haulage International Ltd')).toBe('OA')
    expect(initials('& Co')).toBe('C')
  })

  it('copes with a single word or empty input', () => {
    expect(initials('Jumia')).toBe('J')
    expect(initials('')).toBe('')
  })
})
