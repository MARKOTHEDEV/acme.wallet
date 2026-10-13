import type { Transaction } from '@/types/api'
import { groupByDay } from './group'

const tx = (id: string, createdAt: Date): Transaction => ({
  id,
  reference: `ACM-${id}`,
  type: 'deposit',
  status: 'successful',
  currency: 'NGN',
  amount: 100,
  fee: 0,
  narration: 'Wallet top-up via bank transfer',
  counterparty: null,
  createdAt: createdAt.toISOString(),
})

// Local-time constructors so the expectations hold in any timezone (CI runs in UTC).
const now = new Date(2026, 9, 13, 15, 30) // Tue 13 Oct 2026, 15:30 local

describe('groupByDay', () => {
  it('labels today and yesterday, then uses the full date', () => {
    const groups = groupByDay(
      [
        tx('a', new Date(2026, 9, 13, 9, 0)),
        tx('b', new Date(2026, 9, 12, 23, 59)),
        tx('c', new Date(2026, 9, 5, 10, 15)),
      ],
      now
    )
    expect(groups.map((g) => g.label)).toEqual(['Today', 'Yesterday', 'Mon, 5 Oct 2026'])
  })

  it('keeps consecutive rows of the same day together and preserves order', () => {
    const groups = groupByDay(
      [
        tx('a', new Date(2026, 9, 13, 14, 0)),
        tx('b', new Date(2026, 9, 13, 8, 0)),
        tx('c', new Date(2026, 9, 11)),
      ],
      now
    )
    expect(groups).toHaveLength(2)
    expect(groups[0].transactions.map((t) => t.id)).toEqual(['a', 'b'])
    expect(groups[1].key).toBe('2026-10-11')
  })

  it('splits on local midnight', () => {
    const groups = groupByDay(
      [tx('a', new Date(2026, 9, 13, 0, 0)), tx('b', new Date(2026, 9, 12, 23, 59, 59))],
      now
    )
    expect(groups.map((g) => g.label)).toEqual(['Today', 'Yesterday'])
  })

  it('returns nothing for an empty list', () => {
    expect(groupByDay([], now)).toEqual([])
  })
})
