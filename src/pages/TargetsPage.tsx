import { useState } from 'react'
import { useTargets, useCreateTarget, useUpdateTarget, useDeleteTarget } from '@/hooks/useTargets'
import { useStats } from '@/hooks/useStats'
import PageHeader from '@/components/layout/PageHeader'
import TargetForm from '@/features/targets/components/TargetForm'
import EmptyState from '@/components/shared/EmptyState'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay'
import { Target, Pencil, Trash2, Plus } from 'lucide-react'
import type { Target as TargetType } from '@/types'
import { toast } from 'sonner'

export default function TargetsPage() {
  const { data: targets, isLoading: targetsLoading } = useTargets()
  const { data: stats, isLoading: statsLoading } = useStats()
  const createTarget = useCreateTarget()
  const updateTarget = useUpdateTarget()
  const deleteTarget = useDeleteTarget()

  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<TargetType | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const totalSavings = stats?.totalSavings ?? 0
  const isLoading = targetsLoading || statsLoading

  const handleCreate = async (data: { title: string; targetAmount: number; description?: string | null }) => {
    try {
      await createTarget.mutateAsync(data)
      toast.success('Target berhasil ditambahkan')
      setShowCreate(false)
    } catch {
      toast.error('Gagal menambahkan target')
    }
  }

  const handleUpdate = async (data: { title: string; targetAmount: number; description?: string | null }) => {
    if (!editTarget) return
    try {
      await updateTarget.mutateAsync({ id: editTarget.id, ...data })
      toast.success('Target diperbarui')
      setEditTarget(null)
    } catch {
      toast.error('Gagal memperbarui target')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteTarget.mutateAsync(deleteId)
      toast.success('Target dihapus')
    } catch {
      toast.error('Gagal menghapus target')
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="min-h-dvh bg-background">
      <PageHeader
        title="Target Tabungan"
        subtitle="Kelola tujuan keuanganmu"
        right={
          <Button
            size="sm"
            onClick={() => setShowCreate(true)}
            className="bg-primary hover:bg-primary/90 text-white h-9 px-4 rounded-lg text-sm gap-1.5"
          >
            <Plus size={15} />
            Tambah
          </Button>
        }
      />

      <div className="px-4 pb-4 space-y-4">
        {/* Total savings chip */}
        <div className="flex items-center justify-between bg-muted rounded-xl px-4 py-3">
          <span className="text-sm text-muted-foreground">Total tabungan saat ini</span>
          <CurrencyDisplay amount={totalSavings} size="sm" className="text-foreground font-semibold" />
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : !targets?.length ? (
          <div className="rounded-2xl border border-border bg-white">
            <EmptyState
              icon={Target}
              title="Belum ada target"
              description="Buat target tabungan pertamamu"
              action={
                <Button
                  onClick={() => setShowCreate(true)}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 mt-1 gap-1.5"
                >
                  <Plus size={14} /> Tambah Target
                </Button>
              }
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-white overflow-hidden divide-y divide-border">
            {targets.map((target) => {
              const percent = Math.min(100, Math.round((totalSavings / target.targetAmount) * 100))
              return (
                <div key={target.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{target.title}</p>
                      {target.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{target.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                      <button
                        onClick={() => setEditTarget(target)}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                        aria-label="Edit"
                      >
                        <Pencil size={14} className="text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => setDeleteId(target.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        aria-label="Hapus"
                      >
                        <Trash2 size={14} className="text-muted-foreground" />
                      </button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{percent}% tercapai</span>
                      {percent >= 100 && (
                        <span className="text-[#34A853] font-medium">✓ Tercapai</span>
                      )}
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <CurrencyDisplay amount={totalSavings} size="sm" className="text-muted-foreground" />
                      <CurrencyDisplay amount={target.targetAmount} size="sm" className="text-foreground font-medium" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <TargetForm
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreate}
        isLoading={createTarget.isPending}
      />

      {editTarget && (
        <TargetForm
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          onSubmit={handleUpdate}
          isLoading={updateTarget.isPending}
          defaultValues={editTarget}
          title="Edit Target"
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Hapus target?"
        description="Target akan dihapus permanen."
        onConfirm={handleDelete}
        isLoading={deleteTarget.isPending}
      />
    </div>
  )
}
