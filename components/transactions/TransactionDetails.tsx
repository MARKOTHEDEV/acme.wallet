'use client'
import { useEffect, useState } from 'react'
import type { Transaction, TransactionType } from '@/types/api'
import { Badge, type BadgeTone, Icon, type IconName, Money } from '@/components/ui'
import { cx } from '@/lib/cx'
import { formatDateTime, initials, TRANSACTION_STATUS_LABELS, TRANSACTION_TYPE_LABELS } from '@/lib/format'
import styles from './TransactionDetails.module.css'

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

const CREDIT_TYPES: TransactionType[] = ['deposit', 'transfer_in', 'conversion']

/** "Transfer out to Kwame Mensah" for transfers; the narration otherwise. */
function describe(tx: Transaction): string {
  if (tx.counterparty && tx.type === 'transfer_in') return `Transfer in from ${tx.counterparty}`
  if (tx.counterparty && tx.type === 'transfer_out') return `Transfer out to ${tx.counterparty}`
  return tx.narration
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timer)
  }, [copied])

  return (
    <button
      type="button"
      className={styles.copy}
      aria-label={copied ? 'Copied' : 'Copy reference'}
      onClick={() => navigator.clipboard?.writeText(value).then(() => setCopied(true))}
    >
      <Icon name="copy" size={16} />
      <span className={cx(styles.copied, copied && styles.copiedVisible)} aria-live="polite">
        {copied ? 'Copied' : ''}
      </span>
    </button>
  )
}

export function TransactionDetails({ transaction: tx }: { transaction: Transaction }) {
  const isCredit = CREDIT_TYPES.includes(tx.type)

  return (
    <div className={styles.details}>
      <div className={styles.hero}>
        <span className={styles.avatar} aria-hidden>
          {tx.counterparty ? initials(tx.counterparty) : <Icon name={TYPE_ICONS[tx.type]} size={24} />}
        </span>
        <p className={styles.description}>{describe(tx)}</p>
        <Money
          amount={tx.amount}
          currency={tx.currency}
          sign={isCredit ? 'credit' : 'debit'}
          className={cx(styles.amount, isCredit && styles.credit)}
        />
        <Badge tone={STATUS_TONES[tx.status]} dot>
          {TRANSACTION_STATUS_LABELS[tx.status]}
        </Badge>
      </div>

      <section className={styles.section} aria-labelledby="tx-details-title">
        <h3 id="tx-details-title" className={styles.sectionTitle}>
          Details
        </h3>
        <dl className={styles.list}>
          <div className={styles.row}>
            <dt>Reference</dt>
            <dd className={styles.reference}>
              <span className={styles.mono}>{tx.reference}</span>
              <CopyButton value={tx.reference} />
            </dd>
          </div>
          <div className={styles.row}>
            <dt>Date</dt>
            <dd>{formatDateTime(tx.createdAt)}</dd>
          </div>
          <div className={styles.row}>
            <dt>Type</dt>
            <dd>{TRANSACTION_TYPE_LABELS[tx.type]}</dd>
          </div>
          {tx.counterparty && (
            <div className={styles.row}>
              <dt>Counterparty</dt>
              <dd>{tx.counterparty}</dd>
            </div>
          )}
          <div className={styles.row}>
            <dt>Narration</dt>
            <dd className={styles.narration}>{tx.narration}</dd>
          </div>
        </dl>
      </section>

      <section className={styles.section} aria-labelledby="tx-summary-title">
        <h3 id="tx-summary-title" className={styles.sectionTitle}>
          Summary
        </h3>
        <dl className={styles.list}>
          <div className={styles.row}>
            <dt>Amount</dt>
            <dd>
              <Money amount={tx.amount} currency={tx.currency} />
            </dd>
          </div>
          <div className={styles.row}>
            <dt>Fee</dt>
            <dd>
              <Money amount={tx.fee} currency={tx.currency} />
            </dd>
          </div>
          <div className={cx(styles.row, styles.total)}>
            <dt>Total</dt>
            <dd>
              <Money amount={tx.amount + tx.fee} currency={tx.currency} />
            </dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
