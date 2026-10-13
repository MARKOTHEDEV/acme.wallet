'use client'
import { useEffect, useState } from 'react'
import type { PageMeta, Transaction } from '@/types/api'
import { getTransactions } from '@/lib/api/endpoints'
import { toTransactionQuery, type TransactionsUrlState } from '@/lib/transactions/filters'

export interface TransactionsData {
  transactions: Transaction[]
  meta: PageMeta
}

export interface TransactionsResult {
  /** The last successful page. Kept while the next one loads so the list does not flash. */
  data?: TransactionsData
  /** True while the page for the current state has not arrived yet. */
  loading: boolean
  /** Set when the request for the current state failed. */
  error?: Error
  retry: () => void
}

interface Settled {
  key: string
  data?: TransactionsData
  error?: Error
}

/**
 * Loads the page of transactions described by the URL state. Each request is tagged with a key
 * for its inputs; a response only counts if its key is still current, and the in-flight request
 * is aborted when the inputs change, so a slow earlier search can never overwrite a newer result.
 */
export function useTransactions(state: TransactionsUrlState): TransactionsResult {
  const { q, type, status, page } = state
  const [attempt, setAttempt] = useState(0)
  const [settled, setSettled] = useState<Settled>()
  const key = [q, type ?? '', status ?? '', page, attempt].join('|')

  useEffect(() => {
    const controller = new AbortController()
    getTransactions(toTransactionQuery({ q, type, status, page }), { signal: controller.signal })
      .then((res) => {
        if (!controller.signal.aborted) setSettled({ key, data: { transactions: res.data, meta: res.meta! } })
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setSettled({ key, error: err instanceof Error ? err : new Error('Something went wrong.') })
      })
    return () => controller.abort()
  }, [q, type, status, page, key])

  const current = settled?.key === key
  return {
    data: settled?.data,
    loading: !current,
    error: current ? settled?.error : undefined,
    retry: () => setAttempt((n) => n + 1),
  }
}
