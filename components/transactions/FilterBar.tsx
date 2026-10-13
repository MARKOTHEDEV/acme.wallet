'use client'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import {
  TRANSACTION_STATUSES,
  TRANSACTION_TYPES,
  type TransactionStatus,
  type TransactionType,
} from '@/types/api'
import { Button, Input, Select } from '@/components/ui'
import { TRANSACTION_STATUS_LABELS, TRANSACTION_TYPE_LABELS } from '@/lib/format'
import styles from './FilterBar.module.css'

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  ...TRANSACTION_TYPES.map((type) => ({ value: type, label: TRANSACTION_TYPE_LABELS[type] })),
]

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...TRANSACTION_STATUSES.map((status) => ({ value: status, label: TRANSACTION_STATUS_LABELS[status] })),
]

/** How long to wait after the last keystroke before searching. */
export const SEARCH_DEBOUNCE_MS = 300

export interface FilterBarProps {
  q: string
  type?: TransactionType
  status?: TransactionStatus
  onSearch: (q: string) => void
  onTypeChange: (type?: TransactionType) => void
  onStatusChange: (status?: TransactionStatus) => void
  onClear: () => void
}

export function FilterBar({
  q,
  type,
  status,
  onSearch,
  onTypeChange,
  onStatusChange,
  onClear,
}: FilterBarProps) {
  // The input shows what the user is typing; the URL only updates after a pause.
  const [draft, setDraft] = useState(q)
  const [syncedQ, setSyncedQ] = useState(q)
  if (q !== syncedQ) {
    // The URL changed underneath us (Back, Clear filters): adopt it.
    setSyncedQ(q)
    setDraft(q)
  }

  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setDraft(value)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => onSearch(value.trim()), SEARCH_DEBOUNCE_MS)
  }

  const active = Boolean(q || type || status)

  return (
    <div className={styles.filters}>
      <Input
        label="Search"
        type="search"
        leadingIcon="search"
        placeholder="Search by reference, name or narration"
        value={draft}
        onChange={handleSearch}
        fieldClassName={styles.search}
      />
      <Select
        label="Type"
        options={TYPE_OPTIONS}
        value={type ?? ''}
        onChange={(event) => onTypeChange((event.target.value || undefined) as TransactionType | undefined)}
        fieldClassName={styles.select}
      />
      <Select
        label="Status"
        options={STATUS_OPTIONS}
        value={status ?? ''}
        onChange={(event) =>
          onStatusChange((event.target.value || undefined) as TransactionStatus | undefined)
        }
        fieldClassName={styles.select}
      />
      {active && (
        <Button variant="ghost" onClick={onClear} className={styles.clear}>
          Clear filters
        </Button>
      )}
    </div>
  )
}
