import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cx } from '@/lib/cx'
import { Field } from '../Field'
import { Icon, type IconName } from '../Icon'
import styles from './Input.module.css'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string
  hideLabel?: boolean
  hint?: ReactNode
  error?: string
  leadingIcon?: IconName
  fieldClassName?: string
}

export function Input({
  label,
  hideLabel,
  hint,
  error,
  leadingIcon,
  fieldClassName,
  className,
  id: idProp,
  ...rest
}: InputProps) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const descriptionId = error || hint ? `${id}-description` : undefined

  return (
    <Field
      label={label}
      htmlFor={id}
      hideLabel={hideLabel}
      hint={hint}
      error={error}
      descriptionId={descriptionId}
      className={fieldClassName}
    >
      <div className={styles.control}>
        {leadingIcon && <Icon name={leadingIcon} size={16} className={styles.icon} />}
        <input
          id={id}
          className={cx(styles.input, leadingIcon && styles.withIcon, error && styles.invalid, className)}
          aria-invalid={error ? true : undefined}
          aria-describedby={descriptionId}
          {...rest}
        />
      </div>
    </Field>
  )
}
