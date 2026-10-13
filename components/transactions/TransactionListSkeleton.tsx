import { Skeleton } from '@/components/ui'
import styles from './TransactionListSkeleton.module.css'

export interface TransactionListSkeletonProps {
  rows?: number
  /** Show the day-header band above the rows. */
  header?: boolean
}

/** Placeholder shaped like a day header and a few rows, shown while a list loads. */
export function TransactionListSkeleton({ rows = 6, header = true }: TransactionListSkeletonProps) {
  return (
    <div role="status" aria-label="Loading transactions">
      {header && (
        <div className={styles.day}>
          <Skeleton width={64} height={10} />
        </div>
      )}
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={styles.row}>
          <Skeleton shape="circle" width={40} height={40} />
          <span className={styles.lines}>
            <Skeleton width={120} height={12} />
            <Skeleton width={260} height={10} />
          </span>
          <span className={styles.end}>
            <Skeleton width={96} height={12} />
            <Skeleton width={40} height={10} />
          </span>
        </div>
      ))}
    </div>
  )
}
