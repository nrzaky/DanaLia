import { useStats } from '@/hooks/useStats'
import { Skeleton } from '@/components/ui/skeleton'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay'
import { TrendingUp } from 'lucide-react'

export default function TotalSavingsCard() {
  const { data, isLoading } = useStats()

  return (
    <div className="px-4">
      <div className="rounded-2xl border border-border bg-white p-6">
        <p className="text-sm text-muted-foreground font-medium mb-2">Total Tabungan</p>

        {isLoading ? (
          <Skeleton className="h-10 w-48 mb-3" />
        ) : (
          <div className="mb-4">
            <CurrencyDisplay
              amount={data?.totalSavings ?? 0}
              size="xl"
              className="text-foreground text-3xl font-semibold"
            />
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 p-3 rounded-xl border border-green-100">
            <p className="text-xs text-green-700 font-medium mb-1">Total Setoran</p>
            {isLoading ? <Skeleton className="h-5 w-20" /> : <CurrencyDisplay amount={data?.totalDeposits ?? 0} size="sm" className="text-green-800 font-semibold" />}
          </div>
          <div className="bg-red-50 p-3 rounded-xl border border-red-100">
            <p className="text-xs text-red-700 font-medium mb-1">Total Penarikan</p>
            {isLoading ? <Skeleton className="h-5 w-20" /> : <CurrencyDisplay amount={data?.totalWithdrawals ?? 0} size="sm" className="text-red-800 font-semibold" />}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-[#34A853]">
            <TrendingUp size={14} strokeWidth={2.5} />
            <span className="font-medium">Tetap semangat menabung!</span>
          </div>
          {!isLoading && <span className="text-muted-foreground">{data?.transactionCount} transaksi</span>}
        </div>
      </div>
    </div>
  )
}
