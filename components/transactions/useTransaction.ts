'use client'
import { useEffect, useState } from 'react'
import type { Transaction } from '@/types/api'
import { ApiError } from '@/lib/api/client'
import { getTransaction } from '@/lib/api/endpoints'

export type TransactionLookup =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; transaction: Transaction }
  | { status: 'not-found' }
  | { status: 'error'; error: Error; retry: () => void }

interface Settled {
  key: string
  transaction?: Transaction
  notFound?: boolean
  error?: Error
}

/**
 * The transaction to show in the details drawer. Uses the row already on the page when there is
 * one; otherwise (a shared link, a refresh on another page) fetches it by id.
 */
export function useTransaction(id: string | undefined, known: Transaction | undefined): TransactionLookup {
  const [attempt, setAttempt] = useState(0)
  const [settled, setSettled] = useState<Settled>()
  const key = `${id ?? ''}|${attempt}`
  const needsFetch = Boolean(id) && !known

  useEffect(() => {
    if (!needsFetch || !id) return
    const controller = new AbortController()
    getTransaction(id, { signal: controller.signal })
      .then((res) => {
        if (!controller.signal.aborted) setSettled({ key, transaction: res.data })
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        if (err instanceof ApiError && err.status === 404) setSettled({ key, notFound: true })
        else setSettled({ key, error: err instanceof Error ? err : new Error('Something went wrong.') })
      })
    return () => controller.abort()
  }, [id, key, needsFetch])

  if (!id) return { status: 'idle' }
  if (known) return { status: 'ready', transaction: known }
  if (settled?.key !== key) return { status: 'loading' }
  if (settled.transaction) return { status: 'ready', transaction: settled.transaction }
  if (settled.notFound) return { status: 'not-found' }
  return { status: 'error', error: settled.error!, retry: () => setAttempt((n) => n + 1) }
}
