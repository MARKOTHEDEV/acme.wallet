import styles from './TransactionDetailsSkeleton.module.css'

/** Placeholder for the details drawer while a transaction opened from a link is loading. */
export function TransactionDetailsSkeleton() {
  return (
    <div className={styles.skeleton} role="status" aria-label="Loading transaction">
      <div className={styles.hero}>
        <span className={styles.circle} />
        <span className={styles.bar} style={{ width: 160, height: 12 }} />
        <span className={styles.bar} style={{ width: 200, height: 24 }} />
        <span className={styles.pill} style={{ width: 84, height: 22 }} />
      </div>
      <div className={styles.rows}>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={styles.row}>
            <span className={styles.bar} style={{ width: 90, height: 12 }} />
            <span className={styles.bar} style={{ width: 120, height: 12 }} />
          </div>
        ))}
      </div>
    </div>
  )
}
