import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'
import styles from './Field.module.css'

export interface FieldProps {
  label: string
  /** id of the control the label points at. */
  htmlFor: string
  hint?: ReactNode
  error?: string
  /** id for the hint/error paragraph, so the control can reference it with aria-describedby. */
  descriptionId?: string
  /** Visually hide the label (it is still rendered). */
  hideLabel?: boolean
  className?: string
  children: ReactNode
}

/** Label + control + hint/error. Used by Input and Select. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  descriptionId,
  hideLabel,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={htmlFor} className={cx(styles.label, hideLabel && 'visually-hidden')}>
        {label}
      </label>
      {children}
      {error ? (
        <p id={descriptionId} className={styles.error}>
          {error}
        </p>
      ) : hint ? (
        <p id={descriptionId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}
