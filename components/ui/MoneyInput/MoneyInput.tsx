'use client'
import { useLayoutEffect, useRef, type ChangeEvent } from 'react'
import { formatAmountInput } from '@/lib/format/money'
import { Input, type InputProps } from '../Input'

export interface MoneyInputProps extends Omit<
  InputProps,
  'value' | 'onChange' | 'type' | 'inputMode' | 'ref'
> {
  /** The displayed text, e.g. "1,500.50". Parse it with `parseMoney`. */
  value: string
  onValueChange: (value: string) => void
}

const isSignificant = (char: string) => /[\d.]/.test(char)

/**
 * An amount field that adds thousands separators as the user types and keeps the caret where they
 * were typing. Text input with a decimal keypad on phones; the value is a display string.
 */
export function MoneyInput({ value, onValueChange, ...rest }: MoneyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const caretRef = useRef<number | null>(null)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value
    const next = formatAmountInput(raw)
    const caret = event.target.selectionStart ?? raw.length
    // Keep the same number of digits after the caret, so inserted separators do not move it.
    const digitsAfter = [...raw.slice(caret)].filter(isSignificant).length
    let position = next.length
    let seen = 0
    for (let i = next.length - 1; i >= 0 && seen < digitsAfter; i--) {
      if (isSignificant(next[i])) seen++
      position = i
    }
    caretRef.current = position
    onValueChange(next)
  }

  useLayoutEffect(() => {
    if (caretRef.current === null || !inputRef.current) return
    inputRef.current.setSelectionRange(caretRef.current, caretRef.current)
    caretRef.current = null
  })

  return (
    <Input
      ref={inputRef}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={value}
      onChange={handleChange}
      {...rest}
    />
  )
}
