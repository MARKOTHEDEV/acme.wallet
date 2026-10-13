import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'
import { Icon, type IconName } from '../Icon'
import styles from './EmptyState.module.css'

export interface EmptyStateProps {
  icon: IconName
  tone?: 'primary' | 'danger'
  title: string
  description: string
  /** Usually a Button. */
  action?: ReactNode
  className?: string
}

/** Centred icon, title, description and optional action for empty, no-result and error states. */
export function EmptyState({
  icon,
  tone = 'primary',
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cx(styles.state, className)}>
      <span className={cx(styles.icon, styles[tone])} aria-hidden>
        <Icon name={icon} size={24} />
      </span>
      <div className={styles.text}>
        <p className={styles.title}>{title}</p>
        <p className={styles.description}>{description}</p>
      </div>
      {action}
    </div>
  )
}
