import type { Transaction } from '@/types/api'
import { formatDate } from '@/lib/format/date'

export interface DayGroup {
  /** Local calendar day, YYYY-MM-DD. */
  key: string
  /** "Today", "Yesterday" or e.g. "Mon, 5 Oct 2026". */
  label: string
  transactions: Transaction[]
}

const pad = (n: number) => String(n).padStart(2, '0')

/** The local calendar day a date falls on. */
function dayKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * Group transactions by the local calendar day they happened on, keeping the input order (the API
 * returns newest first). Labels follow the design: Today, Yesterday, then the full date.
 */
export function groupByDay(transactions: readonly Transaction[], now = new Date()): DayGroup[] {
  const today = dayKey(now)
  const yesterday = dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1))
  const groups: DayGroup[] = []

  for (const tx of transactions) {
    const key = dayKey(new Date(tx.createdAt))
    const last = groups[groups.length - 1]
    if (last?.key === key) {
      last.transactions.push(tx)
      continue
    }
    const label = key === today ? 'Today' : key === yesterday ? 'Yesterday' : formatDate(tx.createdAt)
    groups.push({ key, label, transactions: [tx] })
  }

  return groups
}
