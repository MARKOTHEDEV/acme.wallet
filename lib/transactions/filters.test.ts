import {
  DEFAULT_STATE,
  hasActiveFilters,
  parseTransactionsUrl,
  serializeTransactionsUrl,
  toTransactionQuery,
} from './filters'

const parse = (qs: string) => parseTransactionsUrl(new URLSearchParams(qs))

describe('parseTransactionsUrl', () => {
  it('returns defaults for an empty query string', () => {
    expect(parse('')).toEqual(DEFAULT_STATE)
  })

  it('reads valid values', () => {
    expect(parse('q=netflix&type=card_payment&status=failed&page=3&id=txn_1')).toEqual({
      q: 'netflix',
      type: 'card_payment',
      status: 'failed',
      page: 3,
      id: 'txn_1',
    })
  })

  it('ignores values the API does not accept', () => {
    expect(parse('type=refund&status=reversed')).toEqual(DEFAULT_STATE)
  })

  it('falls back to page 1 for anything that is not a positive integer', () => {
    expect(parse('page=0').page).toBe(1)
    expect(parse('page=-2').page).toBe(1)
    expect(parse('page=abc').page).toBe(1)
    expect(parse('page=2.5').page).toBe(1)
  })

  it('trims whitespace and drops blank values', () => {
    expect(parse('q=%20%20&id=%20')).toEqual(DEFAULT_STATE)
    expect(parse('q=%20ada%20').q).toBe('ada')
  })
})

describe('serializeTransactionsUrl', () => {
  it('omits defaults entirely', () => {
    expect(serializeTransactionsUrl(DEFAULT_STATE, new URLSearchParams())).toBe('')
  })

  it('writes only the non-default values', () => {
    const qs = serializeTransactionsUrl({ q: 'ada', page: 2, status: 'pending' }, new URLSearchParams())
    expect(qs).toBe('?q=ada&status=pending&page=2')
  })

  it('keeps parameters it does not own and replaces the ones it does', () => {
    const current = new URLSearchParams('__scenario=slow&page=4&type=deposit')
    expect(serializeTransactionsUrl({ q: '', page: 1 }, current)).toBe('?__scenario=slow')
  })

  it('round-trips through parse', () => {
    const state = { q: 'ref 12', type: 'transfer_in' as const, page: 5, id: 'txn_25c8' }
    expect(parse(serializeTransactionsUrl(state, new URLSearchParams()).slice(1))).toEqual({
      ...state,
      status: undefined,
    })
  })
})

describe('hasActiveFilters', () => {
  it('is false for defaults and paging alone, true for a search or filter', () => {
    expect(hasActiveFilters(DEFAULT_STATE)).toBe(false)
    expect(hasActiveFilters({ q: '', page: 3, id: 'txn_1' })).toBe(false)
    expect(hasActiveFilters({ q: 'x', page: 1 })).toBe(true)
    expect(hasActiveFilters({ q: '', page: 1, type: 'deposit' })).toBe(true)
  })
})

describe('toTransactionQuery', () => {
  it('maps to the API query with a fixed page size and no empty strings', () => {
    expect(toTransactionQuery({ q: '', page: 2, status: 'failed' })).toEqual({
      page: 2,
      limit: 20,
      q: undefined,
      type: undefined,
      status: 'failed',
    })
  })
})
