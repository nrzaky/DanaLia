import { useLatestTransactions } from '@/hooks/useTransactions'
import { Skeleton } from '@/components/ui/skeleton'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay'
import EmptyState from '@/components/shared/EmptyState'
import { formatDate } from '@/utils/date'
import { ArrowRight, Receipt, CreditCard, Banknote, Smartphone, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Transaction } from '@/types'

const methodIcons: Record<string, typeof CreditCard> = {
  'Transfer Bank': CreditCard,
  'QRIS': Smartphone,
  'Tunai': Banknote,
  'E-Wallet': Wallet,
}

const methodColors: Record<string, string> = {
  'Transfer Bank': '#4285F4',
  'QRIS': '#34A853',
  'Tunai': '#FBBC05',
  'E-Wallet': '#673AB7',
}

function TransactionItem({ tx }: { tx: Transaction }) {
  const Icon = methodIcons[tx.paymentMethod] ?? CreditCard
  const color = methodColors[tx.paymentMethod] ?? '#4285F4'

  return (
    <div className="flex items-center gap-3 py-3">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}18` }}
      >
        <Icon size={16} style={{ color }} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {tx.depositMessage || tx.paymentMethod}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{formatDate(tx.transactionDate)}</p>
      </div>
      <CurrencyDisplay amount={tx.amount} size="sm" className="text-foreground flex-shrink-0 font-medium" />
    </div>
  )
}

export default function LatestTransactions() {
  const { data, isLoading } = useLatestTransactions()

  return (
    <div className="px-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-foreground">Transaksi Terbaru</h2>
        <Link
          to="/riwayat"
          className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
        >
          Lihat semua <ArrowRight size={12} />
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-white overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-border">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="w-9 h-9 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-3.5 w-20" />
              </div>
            ))}
          </div>
        ) : !data?.length ? (
          <div className="px-4">
            <EmptyState
              icon={Receipt}
              title="Belum ada transaksi"
              description="Yuk mulai mencatat tabungan pertamamu"
            />
          </div>
        ) : (
          <div className="divide-y divide-border px-4">
            {data.map((tx) => (
              <TransactionItem key={tx.id} tx={tx} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
