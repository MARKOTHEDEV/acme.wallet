'use client'
import { useEffect, useEffectEvent, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { cx } from '@/lib/cx'
import { Button } from '../Button'
import styles from './Drawer.module.css'

export interface DrawerProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** How long the exit animation may take before we unmount regardless (covers reduced motion). */
const EXIT_FALLBACK_MS = 300

/**
 * Side panel (bottom sheet on small screens) with dialog semantics: labelled by its title, closes on
 * Escape or a backdrop click, keeps focus inside while open and hands it back on close. Stays mounted
 * while it animates out.
 */
export function Drawer({ open, title, onClose, children, footer }: DrawerProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(open)
  if (open && !mounted) setMounted(true)
  const closing = mounted && !open
  // Lets the Escape listener call the latest onClose without re-running the effect on every render.
  const closeFromKeyboard = useEffectEvent(() => onClose())

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeFromKeyboard()
      }
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [open])

  useEffect(() => {
    if (!closing) return
    const timer = setTimeout(() => setMounted(false), EXIT_FALLBACK_MS)
    return () => clearTimeout(timer)
  }, [closing])

  const trapFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab' || !panelRef.current) return
    const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
    if (focusable.length === 0) {
      event.preventDefault()
      return
    }
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = document.activeElement
    if (event.shiftKey && (active === first || active === panelRef.current)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  if (!mounted) return null

  return (
    <div className={cx(styles.overlay, closing && styles.closing)} onClick={closing ? undefined : onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-hidden={closing || undefined}
        tabIndex={-1}
        className={styles.panel}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={trapFocus}
        onAnimationEnd={() => {
          if (closing) setMounted(false)
        }}
      >
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            iconLeft="close"
            aria-label="Close"
            onClick={onClose}
            className={styles.close}
          />
        </div>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  )
}
