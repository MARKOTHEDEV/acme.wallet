'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Transaction } from '@/types/api'
import { Button, Card, CardHeader, Drawer, EmptyState, Money } from '@/components/ui'
import { TransactionListSkeleton, TransactionRow } from '@/components/transactions'
import { getTransactions } from '@/lib/api/endpoints'
import { formatDateTime, TRANSACTION_STATUS_LABELS } from '@/lib/format'
import styles from './RecentTransactions.module.css'

const LIMIT = 5

export function RecentTransactions() {
  const [selected, setSelected] = useState<Transaction | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>()
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    getTransactions({ limit: LIMIT })
      .then((res) => {
        if (cancelled) return
        setTransactions(res.data)
        setFailed(false)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  let body
  if (failed) {
    body = (
      <EmptyState
        icon="alert"
        tone="danger"
        title="We couldn't load your transactions"
        description="Check your connection and try again."
        action={
          <Button
            iconLeft="refresh"
            onClick={() => {
              setFailed(false)
              setTransactions(undefined)
              setAttempt((n) => n + 1)
            }}
          >
            Try again
          </Button>
        }
      />
    )
  } else if (!transactions) {
    body = <TransactionListSkeleton rows={LIMIT} header={false} />
  } else if (transactions.length === 0) {
    body = (
      <EmptyState
        icon="inbox"
        title="No transactions yet"
        description="When you add money, send a transfer or pay with your card, it will show up here."
      />
    )
  } else {
    body = transactions.map((tx) => <TransactionRow key={tx.id} transaction={tx} onSelect={setSelected} />)
  }

  return (
    <Card padding="none" aria-busy={!transactions && !failed}>
      <div className={styles.header}>
        <CardHeader
          title="Recent transactions"
          action={
            <Link href="/transactions" className={styles.seeAll}>
              See all
            </Link>
          }
        />
      </div>
      {body}

      <Drawer open={selected !== null} title="Transaction details" onClose={() => setSelected(null)}>
        {selected && (
          <dl className={styles.details}>
            <dt>Reference</dt>
            <dd>{selected.reference}</dd>
            <dt>Amount</dt>
            <dd>
              <Money amount={selected.amount} currency={selected.currency} />
            </dd>
            <dt>Status</dt>
            <dd>{TRANSACTION_STATUS_LABELS[selected.status]}</dd>
            <dt>Date</dt>
            <dd>{formatDateTime(selected.createdAt)}</dd>
          </dl>
        )}
      </Drawer>
    </Card>
  )
}
