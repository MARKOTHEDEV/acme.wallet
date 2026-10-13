'use client'
import { useEffect } from 'react'
import { Button, Card, EmptyState } from '@/components/ui'
import { cx } from '@/lib/cx'
import { hasActiveFilters, PAGE_SIZE } from '@/lib/transactions/filters'
import { FilterBar } from './FilterBar'
import { Pagination } from './Pagination'
import { TransactionList } from './TransactionList'
import { TransactionListSkeleton } from './TransactionListSkeleton'
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
  const { data, loading, error, retry } = useTransactions(state)
  const filtered = hasActiveFilters(state)
  const clearFilters = () => update({ q: '', type: undefined, status: undefined, page: 1 })

  // A page past the end (stale link, or filters that shrank the list) lands on the last page.
  const lastPage = data?.meta.totalPages
  useEffect(() => {
    if (lastPage && state.page > lastPage) update({ page: lastPage }, 'replace')
  }, [lastPage, state.page, update])

  const goToPage = (page: number) => {
    update({ page })
    window.scrollTo({ top: 0 })
  }

  let list
  if (error) {
    list = (
      <EmptyState
        icon="alert"
        tone="danger"
        title="We couldn't load your transactions"
        description="Check your connection and try again."
        action={
          <Button iconLeft="refresh" onClick={retry}>
            Try again
          </Button>
        }
      />
    )
  } else if (!data) {
    list = <TransactionListSkeleton />
  } else if (data.meta.total === 0 && filtered) {
    list = (
      <EmptyState
        icon="search"
        title="No transactions match your filters"
        description="Try a different search term or remove some filters."
        action={
          <Button variant="secondary" onClick={clearFilters}>
            Clear filters
          </Button>
        }
      />
    )
  } else if (data.meta.total === 0) {
    list = (
      <EmptyState
        icon="inbox"
        title="No transactions yet"
        description="When you add money, send a transfer or pay with your card, it will show up here."
      />
    )
  } else {
    list = <TransactionList transactions={data.transactions} onSelect={(tx) => update({ id: tx.id })} />
  }

  return (
    <div className={styles.page}>
      <TransactionsPageHeader subtitle={data ? countLabel(data.meta.total, filtered) : undefined} />

      <FilterBar
        q={state.q}
        type={state.type}
        status={state.status}
        onSearch={(q) => update({ q, page: 1 }, 'replace')}
        onTypeChange={(type) => update({ type, page: 1 })}
        onStatusChange={(status) => update({ status, page: 1 })}
        onClear={clearFilters}
      />

      <Card
        padding="none"
        className={cx(styles.list, loading && data && styles.refreshing)}
        aria-busy={loading}
      >
        {list}
      </Card>

      {data && data.meta.total > 0 && !error && (
        <Pagination
          page={state.page}
          totalPages={data.meta.totalPages}
          total={data.meta.total}
          pageSize={PAGE_SIZE}
          onPageChange={goToPage}
        />
      )}
    </div>
  )
}
