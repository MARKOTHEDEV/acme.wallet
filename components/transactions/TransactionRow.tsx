import type { Transaction, TransactionType } from '@/types/api'
import { Badge, type BadgeTone, Icon, type IconName, Money } from '@/components/ui'
import { cx } from '@/lib/cx'
import { formatTime, initials, TRANSACTION_STATUS_LABELS, TRANSACTION_TYPE_LABELS } from '@/lib/format'
import styles from './TransactionRow.module.css'

const TYPE_ICONS: Record<TransactionType, IconName> = {
  deposit: 'arrow-down-left',
  transfer_in: 'arrow-down-left',
  withdrawal: 'arrow-up-right',
  transfer_out: 'arrow-up-right',
  conversion: 'swap',
  card_payment: 'card',
  bill_payment: 'receipt',
}

const STATUS_TONES: Record<Transaction['status'], BadgeTone> = {
  successful: 'success',
  pending: 'warning',
  failed: 'danger',
}

/** Money coming into the wallet. A conversion row is recorded in the currency received. */
const CREDIT_TYPES: TransactionType[] = ['deposit', 'transfer_in', 'conversion']

export interface TransactionRowProps {
  transaction: Transaction
  onSelect?: (transaction: Transaction) => void
}

export function TransactionRow({ transaction: tx, onSelect }: TransactionRowProps) {
  const isCredit = CREDIT_TYPES.includes(tx.type)

  return (
    <button type="button" className={styles.row} onClick={() => onSelect?.(tx)}>
      <span className={styles.icon} aria-hidden>
        {tx.counterparty ? initials(tx.counterparty) : <Icon name={TYPE_ICONS[tx.type]} size={18} />}
      </span>
      <span className={styles.main}>
        <span className={styles.title}>{TRANSACTION_TYPE_LABELS[tx.type]}</span>
        <span className={styles.narration}>{tx.narration}</span>
      </span>
      <span className={styles.status}>
        <Badge tone={STATUS_TONES[tx.status]} dot>
          {TRANSACTION_STATUS_LABELS[tx.status]}
        </Badge>
      </span>
      <span className={styles.end}>
        <Money
          amount={tx.amount}
          currency={tx.currency}
          sign={isCredit ? 'credit' : 'debit'}
          className={cx(styles.amount, isCredit && styles.credit)}
        />
        <span className={styles.time}>{formatTime(tx.createdAt)}</span>
      </span>
    </button>
  )
}
