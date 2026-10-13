'use client'
import { useState } from 'react'
import type { Transaction } from '@/types/api'
import { Button, Drawer, EmptyState } from '@/components/ui'
import { TransactionDetails } from './TransactionDetails'
import { TransactionDetailsSkeleton } from './TransactionDetailsSkeleton'
import { useTransaction } from './useTransaction'

export interface TransactionDrawerProps {
  /** The `id` from the URL; the drawer is open while it is set. */
  id?: string
  /** Rows already on the page, so a click opens instantly without a request. */
  transactions?: Transaction[]
  onClose: () => void
}

export function TransactionDrawer({ id, transactions, onClose }: TransactionDrawerProps) {
  // Keep showing the last transaction while the drawer slides out.
  const [lastId, setLastId] = useState(id)
  if (id && id !== lastId) setLastId(id)
  const shownId = id ?? lastId

  const known = transactions?.find((tx) => tx.id === shownId)
  const lookup = useTransaction(shownId, known)

  let body
  switch (lookup.status) {
    case 'ready':
      body = <TransactionDetails transaction={lookup.transaction} />
      break
    case 'not-found':
      body = (
        <EmptyState
          icon="search"
          title="Transaction not found"
          description="It may have been removed, or the link is wrong."
          action={
            <Button variant="secondary" onClick={onClose}>
              Back to transactions
            </Button>
          }
        />
      )
      break
    case 'error':
      body = (
        <EmptyState
          icon="alert"
          tone="danger"
          title="We couldn't load this transaction"
          description="Check your connection and try again."
          action={
            <Button iconLeft="refresh" onClick={lookup.retry}>
              Try again
            </Button>
          }
        />
      )
      break
    default:
      body = <TransactionDetailsSkeleton />
  }

  return (
    <Drawer open={Boolean(id)} title="Transaction details" onClose={onClose}>
      {body}
    </Drawer>
  )
}
