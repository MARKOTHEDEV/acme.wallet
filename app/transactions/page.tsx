import type { Metadata } from 'next'
import { Suspense } from 'react'
import { TransactionsPage, TransactionsPageHeader } from '@/components/transactions'

export const metadata: Metadata = { title: 'Transactions' }

/**
 * The page reads its state from the URL on the client, which needs a Suspense boundary for the
 * static prerender. The fallback is the static header so the first paint is not blank.
 */
export default function Page() {
  return (
    <Suspense fallback={<TransactionsPageHeader />}>
      <TransactionsPage />
    </Suspense>
  )
}
