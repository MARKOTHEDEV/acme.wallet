import { Button } from '@/components/ui'
import { cx } from '@/lib/cx'
import styles from './Pagination.module.css'

export interface PaginationProps {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
}

const ELLIPSIS = '…'

/**
 * Page numbers to show: the first and last page plus a window of three around the current one
 * (shifted inwards at the edges), with gaps collapsed to an ellipsis. For 12 pages:
 * page 1 -> 1 2 3 … 12, page 6 -> 1 … 5 6 7 … 12, page 12 -> 1 … 10 11 12.
 */
export function pageItems(page: number, totalPages: number): Array<number | typeof ELLIPSIS> {
  const start = Math.max(1, Math.min(page - 1, totalPages - 2))
  const window = [start, start + 1, start + 2]
  const pages = [...new Set([1, ...window, totalPages])].filter((p) => p >= 1 && p <= totalPages)
  const items: Array<number | typeof ELLIPSIS> = []
  for (const [i, p] of pages.entries()) {
    if (i > 0 && p - pages[i - 1] > 1) items.push(ELLIPSIS)
    items.push(p)
  }
  return items
}

export function Pagination({ page, totalPages, total, pageSize, onPageChange }: PaginationProps) {
  const first = (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <p className={styles.summary}>
        Showing {first.toLocaleString('en-NG')}–{last.toLocaleString('en-NG')} of{' '}
        {total.toLocaleString('en-NG')}
      </p>
      <p className={styles.mobileSummary}>
        Page {page} of {totalPages}
      </p>
      <div className={styles.controls}>
        <Button
          variant="secondary"
          size="sm"
          iconLeft="chevron-left"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={styles.prev}
        >
          <span className={styles.long}>Previous</span>
          <span className={styles.short}>Prev</span>
        </Button>
        <div className={styles.pages}>
          {pageItems(page, totalPages).map((item, i) =>
            item === ELLIPSIS ? (
              <span key={`gap-${i}`} className={styles.ellipsis} aria-hidden>
                {ELLIPSIS}
              </span>
            ) : (
              <button
                key={item}
                type="button"
                className={cx(styles.page, item === page && styles.current)}
                aria-current={item === page ? 'page' : undefined}
                aria-label={`Page ${item}`}
                onClick={() => onPageChange(item)}
              >
                {item}
              </button>
            )
          )}
        </div>
        <Button
          variant="secondary"
          size="sm"
          iconRight="chevron-right"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className={styles.next}
        >
          Next
        </Button>
      </div>
    </nav>
  )
}
