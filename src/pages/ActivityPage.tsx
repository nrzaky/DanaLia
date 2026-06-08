import { useState, useEffect } from 'react'
import { activityService } from '@/services/activityService'
import PageHeader from '@/components/layout/PageHeader'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import EmptyState from '@/components/shared/EmptyState'
import { formatDate } from '@/utils/date'
import { Activity, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { ActivityLog } from '@/types'

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const loadActivities = async () => {
      setIsLoading(true)
      try {
        const data = await activityService.getActivities()
        setActivities(data)
      } catch (error) {
        console.error('Failed to load activities', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadActivities()
  }, [])

  const filteredActivities = activities.filter(a => 
    a.action.toLowerCase().includes(search.toLowerCase()) || 
    a.user?.username.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-dvh bg-background">
      <PageHeader title="Log Aktivitas" subtitle="Jejak audit sistem" />

      <div className="px-4 space-y-4 mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari aktivitas atau pengguna..."
            className="pl-9 h-10 border-border focus-visible:ring-primary bg-white"
          />
        </div>

        <div className="rounded-2xl border border-border bg-white overflow-hidden">
          {isLoading ? (
            <div className="p-8"><LoadingSpinner /></div>
          ) : !filteredActivities.length ? (
            <EmptyState
              icon={Activity}
              title="Tidak ada aktivitas"
              description="Belum ada catatan aktivitas yang ditemukan"
            />
          ) : (
            <div className="divide-y divide-border">
              {filteredActivities.map((log) => (
                <div key={log.id} className="p-4 flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Activity size={14} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {log.action}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 mb-1">
                      Oleh: <span className="font-medium text-foreground">{log.user?.fullName || log.user?.username || log.userId}</span>
                    </p>
                    {log.description && (
                      <p className="text-xs text-muted-foreground bg-muted p-2 rounded-lg mb-2">
                        {log.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="bg-muted px-1.5 py-0.5 rounded uppercase">{log.entityType}</span>
                      <span>ID: {log.entityId}</span>
                      <span>•</span>
                      <span>{formatDate(log.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
