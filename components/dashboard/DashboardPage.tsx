'use client'
import { useEffect, useState } from 'react'
import type { User } from '@/types/api'
import { Button, Card, EmptyState } from '@/components/ui'
import { useTransactionsUrl } from '@/components/transactions'
import { getMe } from '@/lib/api/endpoints'
import { BalanceSummary } from './BalanceSummary'
import { DashboardSkeleton } from './DashboardSkeleton'
import { RatesWidget } from './RatesWidget'
import { RecentTransactions } from './RecentTransactions'
import { WalletCard } from './WalletCard'
import styles from './DashboardPage.module.css'

export function DashboardPage() {
  const { state, update } = useTransactionsUrl()
  const [user, setUser] = useState<User>()
  const [error, setError] = useState<string>()
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    getMe()
      .then((res) => {
        if (!cancelled) setUser(res.data)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Something went wrong.')
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  let overview
  if (error) {
    overview = (
      <Card padding="none">
        <EmptyState
          icon="alert"
          tone="danger"
          title="We couldn't load your dashboard"
          description="Check your connection and try again."
          action={
            <Button
              iconLeft="refresh"
              onClick={() => {
                setError(undefined)
                setAttempt((n) => n + 1)
              }}
            >
              Try again
            </Button>
          }
        />
      </Card>
    )
  } else if (!user) {
    overview = <DashboardSkeleton />
  } else {
    overview = (
      <>
        <header>
          <h1 className={styles.title}>Welcome back, {user.firstName}</h1>
          <p className={styles.subtitle}>Here&apos;s what&apos;s happening with your money today.</p>
        </header>

        <BalanceSummary wallets={user.wallets} />

        <div className={styles.wallets}>
          {user.wallets.map((wallet) => (
            <WalletCard key={wallet.currency} wallet={wallet} />
          ))}
        </div>
      </>
    )
  }

  return (
    <div className={styles.page}>
      {overview}

      <div className={styles.columns}>
        <RecentTransactions
          openId={state.id}
          onOpen={(id) => update({ id })}
          onClose={() => update({ id: undefined }, 'replace')}
        />
        <RatesWidget base="NGN" />
      </div>
    </div>
  )
}
