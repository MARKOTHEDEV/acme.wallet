'use client'
import { useEffect, useState } from 'react'
import type { User } from '@/types/api'
import {
  BalanceSummary,
  DashboardSkeleton,
  RatesWidget,
  RecentTransactions,
  WalletCard,
} from '@/components/dashboard'
import { Button, Card, EmptyState } from '@/components/ui'
import { getMe } from '@/lib/api/endpoints'
import styles from './page.module.css'

export default function DashboardPage() {
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
        <RecentTransactions />
        <RatesWidget base="NGN" />
      </div>
    </div>
  )
}
