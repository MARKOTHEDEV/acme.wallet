import { Card, Skeleton } from '@/components/ui'
import styles from './DashboardSkeleton.module.css'

/** Placeholders for the greeting, balance and wallet cards while the user loads. */
export function DashboardSkeleton() {
  return (
    <div className={styles.skeleton} role="status" aria-label="Loading your dashboard">
      <div className={styles.header}>
        <Skeleton width={280} height={28} />
        <Skeleton width={320} height={14} />
      </div>
      <Card className={styles.balance}>
        <div className={styles.stack}>
          <Skeleton width={88} height={12} />
          <Skeleton width={240} height={34} />
        </div>
        <Skeleton width={64} height={32} />
      </Card>
      <div className={styles.wallets}>
        {Array.from({ length: 3 }, (_, i) => (
          <Card key={i} className={styles.wallet}>
            <Skeleton width={72} height={12} />
            <Skeleton width={150} height={22} />
          </Card>
        ))}
      </div>
    </div>
  )
}
