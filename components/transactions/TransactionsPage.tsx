'use client'
import { Card } from '@/components/ui'
import { hasActiveFilters } from '@/lib/transactions/filters'
import { FilterBar } from './FilterBar'
import { TransactionRow } from './TransactionRow'
import { useTransactions } from './useTransactions'
import { useTransactionsUrl } from './useTransactionsUrl'
import styles from './TransactionsPage.module.css'

export function TransactionsPageHeader({ subtitle }: { subtitle?: string }) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Transactions</h1>
      <p className={styles.subtitle} aria-live="polite">
        {subtitle ?? ' '}
      </p>
    </header>
  )
}

function countLabel(total: number, filtered: boolean): string {
  const noun = filtered ? 'result' : 'transaction'
  return `${total.toLocaleString('en-NG')} ${noun}${total === 1 ? '' : 's'}`
}

export function TransactionsPage() {
  const { state, update } = useTransactionsUrl()
  const { data, loading, error } = useTransactions(state)
  const filtered = hasActiveFilters(state)

  return (
    <div className={styles.page}>
      <TransactionsPageHeader
        subtitle={data ? countLabel(data.meta.total, filtered) : error ? undefined : 'Loading…'}
      />

      <FilterBar
        q={state.q}
        type={state.type}
        status={state.status}
        onSearch={(q) => update({ q, page: 1 }, 'replace')}
        onTypeChange={(type) => update({ type, page: 1 })}
        onStatusChange={(status) => update({ status, page: 1 })}
        onClear={() => update({ q: '', type: undefined, status: undefined, page: 1 })}
      />

      <Card padding="none" aria-busy={loading}>
        {error && !data && <p className={styles.message}>{error.message}</p>}
        {!error && !data && <p className={styles.message}>Loading…</p>}
        {data?.transactions.map((tx) => (
          <TransactionRow key={tx.id} transaction={tx} onSelect={(tx) => update({ id: tx.id })} />
        ))}
      </Card>
    </div>
  )
}
