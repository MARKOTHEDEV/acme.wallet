import styles from './TransactionListSkeleton.module.css'

const ROWS = 6

/** Placeholder shown on the first load, shaped like a day header and six rows. */
export function TransactionListSkeleton() {
  return (
    <div role="status" aria-label="Loading transactions">
      <div className={styles.day}>
        <span className={styles.bar} style={{ width: 64, height: 10 }} />
      </div>
      {Array.from({ length: ROWS }, (_, i) => (
        <div key={i} className={styles.row}>
          <span className={styles.circle} />
          <span className={styles.lines}>
            <span className={styles.bar} style={{ width: 120, height: 12 }} />
            <span className={styles.bar} style={{ width: 260, height: 10 }} />
          </span>
          <span className={styles.end}>
            <span className={styles.bar} style={{ width: 96, height: 12 }} />
            <span className={styles.bar} style={{ width: 40, height: 10 }} />
          </span>
        </div>
      ))}
    </div>
  )
}
