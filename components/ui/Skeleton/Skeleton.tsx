import type { CSSProperties } from 'react'
import { cx } from '@/lib/cx'
import styles from './Skeleton.module.css'

export interface SkeletonProps {
  width?: CSSProperties['width']
  height?: CSSProperties['height']
  /** `bar` has small rounded corners; `circle` and `pill` are fully rounded. */
  shape?: 'bar' | 'circle' | 'pill'
  className?: string
}

/** A grey placeholder block for loading states. Decorative: label the surrounding region instead. */
export function Skeleton({ width, height, shape = 'bar', className }: SkeletonProps) {
  return (
    <span className={cx(styles.skeleton, styles[shape], className)} style={{ width, height }} aria-hidden />
  )
}
