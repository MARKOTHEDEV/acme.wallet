'use client'
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { cx } from '@/lib/cx'
import { Field } from '../Field'
import { Icon } from '../Icon'
import styles from './Select.module.css'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  label: string
  hideLabel?: boolean
  options: readonly SelectOption[]
  value: string
  onChange: (value: string) => void
  id?: string
  fieldClassName?: string
}

/**
 * A select with a styled menu (a native <select> cannot render the design's options panel).
 * Follows the "select-only combobox" pattern: the trigger keeps focus and announces the
 * highlighted option through aria-activedescendant; arrow keys move, Enter or Space choose,
 * Escape and outside clicks close.
 */
export function Select({
  label,
  hideLabel,
  options,
  value,
  onChange,
  id: idProp,
  fieldClassName,
}: SelectProps) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const listId = `${id}-listbox`
  const optionId = (index: number) => `${id}-option-${index}`

  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  )
  const [activeIndex, setActiveIndex] = useState(selectedIndex)

  const openMenu = () => {
    setActiveIndex(selectedIndex)
    setOpen(true)
  }
  const closeMenu = () => setOpen(false)
  const choose = (index: number) => {
    const option = options[index]
    if (option && option.value !== value) onChange(option.value)
    closeMenu()
    triggerRef.current?.focus()
  }

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    document.getElementById(optionId(activeIndex))?.scrollIntoView?.({ block: 'nearest' })
  })

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const last = options.length - 1
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        if (!open) openMenu()
        else setActiveIndex((i) => Math.min(last, i + 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        if (!open) openMenu()
        else setActiveIndex((i) => Math.max(0, i - 1))
        break
      case 'Home':
        if (open) {
          event.preventDefault()
          setActiveIndex(0)
        }
        break
      case 'End':
        if (open) {
          event.preventDefault()
          setActiveIndex(last)
        }
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (open) choose(activeIndex)
        else openMenu()
        break
      case 'Escape':
        if (open) {
          event.preventDefault()
          closeMenu()
        }
        break
      case 'Tab':
        closeMenu()
        break
      default:
        if (open && event.key.length === 1 && /\S/.test(event.key)) {
          const letter = event.key.toLowerCase()
          const start = activeIndex + 1
          const match = [...options.keys()]
            .map((i) => (start + i) % options.length)
            .find((i) => options[i].label.toLowerCase().startsWith(letter))
          if (match !== undefined) setActiveIndex(match)
        }
    }
  }

  return (
    <Field label={label} htmlFor={id} hideLabel={hideLabel} className={fieldClassName}>
      <div ref={rootRef} className={styles.control}>
        <button
          ref={triggerRef}
          type="button"
          id={id}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-activedescendant={open ? optionId(activeIndex) : undefined}
          className={styles.trigger}
          onClick={() => (open ? closeMenu() : openMenu())}
          onKeyDown={handleKeyDown}
        >
          <span className={styles.value}>{options[selectedIndex]?.label}</span>
          <Icon name="chevron-down" size={16} className={styles.chevron} />
        </button>
        {open && (
          <ul
            id={listId}
            role="listbox"
            aria-labelledby={id}
            className={styles.menu}
            // Keep focus on the trigger while clicking options.
            onMouseDown={(event) => event.preventDefault()}
          >
            {options.map((option, index) => (
              <li
                key={option.value}
                id={optionId(index)}
                role="option"
                aria-selected={index === selectedIndex}
                className={cx(
                  styles.option,
                  index === selectedIndex && styles.selected,
                  index === activeIndex && styles.active
                )}
                onPointerMove={() => setActiveIndex(index)}
                onClick={() => choose(index)}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Field>
  )
}
