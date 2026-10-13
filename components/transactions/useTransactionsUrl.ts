'use client'
import { usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import {
  parseTransactionsUrl,
  serializeTransactionsUrl,
  type TransactionsUrlState,
} from '@/lib/transactions/filters'

export type UrlUpdateMode = 'push' | 'replace'

/**
 * The Transactions page state, read from and written to the query string. Writes go through the
 * History API, which Next's router picks up, so there is no server round trip and no scroll jump.
 * `push` adds a history entry (Back undoes it); `replace` does not (for keystrokes).
 */
export function useTransactionsUrl() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const state = useMemo(() => parseTransactionsUrl(searchParams), [searchParams])

  const update = useCallback(
    (patch: Partial<TransactionsUrlState>, mode: UrlUpdateMode = 'push') => {
      const current = new URLSearchParams(window.location.search)
      const next = { ...parseTransactionsUrl(current), ...patch }
      const url = `${pathname}${serializeTransactionsUrl(next, current)}`
      if (mode === 'replace') window.history.replaceState(null, '', url)
      else window.history.pushState(null, '', url)
    },
    [pathname]
  )

  return { state, update }
}
