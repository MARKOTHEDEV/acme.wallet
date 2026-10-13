import type { Transaction } from '@/types/api'
import { groupByDay } from '@/lib/transactions/group'
import { TransactionRow } from './TransactionRow'
import styles from './TransactionList.module.css'

export interface TransactionListProps {
  transactions: Transaction[]
  onSelect: (transaction: Transaction) => void
}

/** Rows grouped under day headers (Today, Yesterday, then the date). */
export function TransactionList({ transactions, onSelect }: TransactionListProps) {
  return (
    <>
      {groupByDay(transactions).map((group) => (
        <section key={group.key} aria-label={group.label}>
          <h2 className={styles.day}>{group.label}</h2>
          {group.transactions.map((tx) => (
            <TransactionRow key={tx.id} transaction={tx} onSelect={onSelect} />
          ))}
        </section>
      ))}
    </>
  )
}
