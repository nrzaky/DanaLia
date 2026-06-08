import { useTargets } from '@/hooks/useTargets'
import { useStats } from '@/hooks/useStats'
import { Skeleton } from '@/components/ui/skeleton'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay'
import EmptyState from '@/components/shared/EmptyState'
import { Target, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function TargetProgressCards() {
  const { data: targets, isLoading: targetsLoading } = useTargets()
  const { data: stats, isLoading: statsLoading } = useStats()

  const totalSavings = stats?.totalSavings ?? 0
  const isLoading = targetsLoading || statsLoading

  return (
    <div className="px-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-foreground">Target Tabungan</h2>
        <Link
          to="/target"
          className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
        >
          Kelola <ArrowRight size={12} />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-white p-4">
              <Skeleton className="h-4 w-28 mb-3" />
              <Skeleton className="h-1.5 w-full rounded-full mb-2" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : !targets?.length ? (
        <div className="rounded-2xl border border-border bg-white p-4">
          <EmptyState
            icon={Target}
            title="Belum ada target"
            description="Tambahkan target tabunganmu"
            action={
              <Link to="/target" className="text-sm text-primary font-medium hover:underline">
                + Tambah Target
              </Link>
            }
          />
        </div>
      ) : (
        <div className="space-y-2">
          {targets.map((target) => {
            const percent = Math.min(100, Math.round((totalSavings / target.targetAmount) * 100))
            return (
              <div
                key={target.id}
                className="rounded-2xl border border-border bg-white p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{target.title}</p>
                    {target.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{target.description}</p>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-primary ml-2 flex-shrink-0">{percent}%</span>
                </div>

                {/* Progress track */}
                <div className="w-full h-1.5 bg-muted rounded-full mb-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <CurrencyDisplay amount={totalSavings} size="sm" className="text-muted-foreground" />
                  <CurrencyDisplay amount={target.targetAmount} size="sm" className="text-foreground font-medium" />
                </div>

                {percent >= 100 && (
                  <p className="text-xs text-[#34A853] font-medium mt-2 flex items-center gap-1">
                    ✓ Target tercapai!
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
