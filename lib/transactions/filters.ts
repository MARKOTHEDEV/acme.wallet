import type { TransactionQuery } from '@/lib/api/endpoints'
import {
  TRANSACTION_STATUSES,
  TRANSACTION_TYPES,
  type TransactionStatus,
  type TransactionType,
} from '@/types/api'

/** Rows per page on the Transactions page (the API's default). */
export const PAGE_SIZE = 20

/** Everything the Transactions page keeps in the URL, so refresh, sharing and Back restore it. */
export interface TransactionsUrlState {
  q: string
  type?: TransactionType
  status?: TransactionStatus
  page: number
  /** Transaction open in the details drawer. */
  id?: string
}

export const DEFAULT_STATE: TransactionsUrlState = { q: '', page: 1 }

const OWN_KEYS = ['q', 'type', 'status', 'page', 'id'] as const

const isType = (value: string): value is TransactionType =>
  (TRANSACTION_TYPES as readonly string[]).includes(value)
const isStatus = (value: string): value is TransactionStatus =>
  (TRANSACTION_STATUSES as readonly string[]).includes(value)

/** Read the page state from a query string, ignoring anything invalid. */
export function parseTransactionsUrl(params: URLSearchParams): TransactionsUrlState {
  const type = params.get('type') ?? ''
  const status = params.get('status') ?? ''
  const page = Number(params.get('page'))
  const id = params.get('id')?.trim()

  return {
    q: params.get('q')?.trim() ?? '',
    type: isType(type) ? type : undefined,
    status: isStatus(status) ? status : undefined,
    page: Number.isInteger(page) && page >= 1 ? page : 1,
    id: id ? id : undefined,
  }
}

/**
 * Write the page state back into a query string. Defaults are omitted so the URL stays short, and
 * parameters the page doesn't own (for example `__scenario`) are preserved.
 */
export function serializeTransactionsUrl(state: TransactionsUrlState, current: URLSearchParams): string {
  const params = new URLSearchParams(current)
  for (const key of OWN_KEYS) params.delete(key)

  if (state.q) params.set('q', state.q)
  if (state.type) params.set('type', state.type)
  if (state.status) params.set('status', state.status)
  if (state.page > 1) params.set('page', String(state.page))
  if (state.id) params.set('id', state.id)

  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

/** True when a search term or a filter narrows the list. */
export function hasActiveFilters(state: TransactionsUrlState): boolean {
  return Boolean(state.q || state.type || state.status)
}

/** The API query for a page state. */
export function toTransactionQuery(state: TransactionsUrlState): TransactionQuery {
  return {
    page: state.page,
    limit: PAGE_SIZE,
    q: state.q || undefined,
    type: state.type,
    status: state.status,
  }
}
