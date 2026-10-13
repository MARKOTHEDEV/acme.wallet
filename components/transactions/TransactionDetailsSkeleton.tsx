import { Skeleton } from '@/components/ui'
import styles from './TransactionDetailsSkeleton.module.css'

/** Placeholder for the details drawer while a transaction opened from a link is loading. */
export function TransactionDetailsSkeleton() {
  return (
    <div className={styles.skeleton} role="status" aria-label="Loading transaction">
      <div className={styles.hero}>
        <Skeleton shape="circle" width={48} height={48} />
        <Skeleton width={160} height={12} />
        <Skeleton width={200} height={24} />
        <Skeleton shape="pill" width={84} height={22} />
      </div>
      <div className={styles.rows}>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={styles.row}>
            <Skeleton width={90} height={12} />
            <Skeleton width={120} height={12} />
          </div>
        ))}
      </div>
    </div>
  )
}
