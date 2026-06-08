import TotalSavingsCard from '@/features/dashboard/components/TotalSavingsCard'
import LatestTransactions from '@/features/dashboard/components/LatestTransactions'
import TargetProgressCards from '@/features/dashboard/components/TargetProgressCards'
import GalleryPreview from '@/features/dashboard/components/GalleryPreview'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

export default function DashboardPage() {
  const now = new Date()
  const greeting =
    now.getHours() < 12
      ? 'Selamat pagi'
      : now.getHours() < 17
      ? 'Selamat siang'
      : 'Selamat malam'
  const dateStr = format(now, 'EEEE, d MMMM yyyy', { locale: localeId })

  return (
    <div className="bg-background pb-4">
      {/* Header */}
      <div className="px-4 pt-6 pb-5">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">{dateStr}</p>
        <h1 className="text-2xl font-semibold text-foreground">{greeting}, Lia</h1>
      </div>

      {/* Content sections */}
      <div className="space-y-6">
        <TotalSavingsCard />
        <LatestTransactions />
        <TargetProgressCards />
        <GalleryPreview />
      </div>
    </div>
  )
}
