import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTransactions, useDeleteTransaction } from '@/hooks/useTransactions'
import { useDebounce } from '@/hooks/useDebounce'
import PageHeader from '@/components/layout/PageHeader'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay'
import EmptyState from '@/components/shared/EmptyState'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/utils/date'
import {
  Search, Pencil, Trash2, Receipt, ExternalLink,
  ChevronLeft, ChevronRight, CreditCard, Banknote, Smartphone, Wallet,
  FileText, Loader2
} from 'lucide-react'
import type { Transaction } from '@/types'
import { toast } from 'sonner'
import { MONTHS, YEARS } from '@/utils/date'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { exportService } from '@/services/statsService'

type FilterMode = 'all' | 'day' | 'month' | 'year'

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

function TransactionRow({
  tx, onEdit, onDelete, onViewDetail
}: { tx: Transaction; onEdit: () => void; onDelete: () => void; onViewDetail: () => void }) {
  const Icon = methodIcons[tx.paymentMethod] ?? CreditCard
  const color = methodColors[tx.paymentMethod] ?? '#4285F4'

  return (
    <div className="flex items-center gap-3 py-3 px-4">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}18` }}
      >
        <Icon size={16} style={{ color }} strokeWidth={2} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-medium text-foreground truncate">
            {tx.depositMessage || tx.paymentMethod}
          </p>
          {tx.transactionType === 'DEPOSIT' ? (
            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
              Setoran
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
              Penarikan
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {tx.paymentMethod} · {formatDate(tx.transactionDate)}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <CurrencyDisplay amount={tx.amount} size="sm" className={`font-medium ${tx.transactionType === 'WITHDRAWAL' ? 'text-red-600' : 'text-green-600'}`} />
        {tx.proofUrl && (
          <a
            href={tx.proofUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink size={13} />
          </a>
        )}
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          aria-label="Edit"
        >
          <Pencil size={14} className="text-muted-foreground" />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
          aria-label="Hapus"
        >
          <Trash2 size={14} className="text-muted-foreground hover:text-destructive" />
        </button>
        <button
          onClick={onViewDetail}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors ml-1"
          title="Lihat Riwayat"
          aria-label="Lihat Riwayat"
        >
          <ExternalLink size={14} className="text-muted-foreground" />
        </button>
      </div>
    </div>
  )
}

export default function HistoryPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [mode, setMode] = useState<FilterMode>('all')
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [monthNum, setMonthNum] = useState('')
  const [year, setYear] = useState('')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const debouncedSearch = useDebounce(search)
  const deleteMutation = useDeleteTransaction()

  const filter: Record<string, string | number> = { page, limit: 10 }
  if (debouncedSearch) filter.search = debouncedSearch
  if (mode === 'day' && day) filter.day = day
  if (mode === 'month' && month && monthNum) filter.month = `${month}-${monthNum}`
  if (mode === 'year' && year) filter.year = year

  const { data, isLoading } = useTransactions(filter as any)

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      toast.success('Setoran dihapus')
    } catch {
      toast.error('Gagal menghapus setoran')
    } finally {
      setDeleteId(null)
    }
  }

  const handleExport = async () => {
    if (mode === 'day' && day) {
      setIsExporting(true)
      const toastId = toast.loading('Sedang mengunduh laporan harian...')
      try {
        await exportService.downloadDailyPDF(day)
        toast.success('Laporan berhasil diunduh!', { id: toastId })
      } catch (error: any) {
        toast.error(error.message || 'Gagal mengunduh laporan', { id: toastId })
      } finally {
        setIsExporting(false)
      }
    } else if (mode === 'month' && month && monthNum) {
      setIsExporting(true)
      const toastId = toast.loading('Sedang mengunduh laporan bulanan...')
      try {
        await exportService.downloadMonthlyPDF(month, monthNum)
        toast.success('Laporan berhasil diunduh!', { id: toastId })
      } catch (error: any) {
        toast.error(error.message || 'Gagal mengunduh laporan', { id: toastId })
      } finally {
        setIsExporting(false)
      }
    } else {
      toast.error('Pilih filter Hari atau Bulan terlebih dahulu untuk mengekspor data.')
    }
  }

  const filterModes: { value: FilterMode; label: string }[] = [
    { value: 'all', label: 'Semua' },
    { value: 'day', label: 'Hari' },
    { value: 'month', label: 'Bulan' },
    { value: 'year', label: 'Tahun' },
  ]

  return (
    <div className="min-h-dvh bg-background">
      <PageHeader title="Riwayat" subtitle="Catatan semua setoran" />

      <div className="px-4 space-y-3 mb-4">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Cari catatan setoran..."
            className="pl-9 h-10 border-border focus-visible:ring-primary"
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          {filterModes.map((m) => (
            <button
              key={m.value}
              onClick={() => { setMode(m.value); setPage(1) }}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                mode === m.value
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-muted-foreground border-border hover:border-primary hover:text-primary'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Date filters */}
        {mode === 'day' && (
          <Input
            type="date"
            value={day}
            onChange={(e) => { setDay(e.target.value); setPage(1) }}
            className="h-10 border-border focus-visible:ring-primary"
          />
        )}
        {mode === 'month' && (
          <div className="flex gap-2">
            <Select onValueChange={(v) => { setMonth(v); setPage(1) }}>
              <SelectTrigger className="h-10 flex-1 border-border">
                <SelectValue placeholder="Tahun" />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select onValueChange={(v) => { setMonthNum(v); setPage(1) }}>
              <SelectTrigger className="h-10 flex-1 border-border">
                <SelectValue placeholder="Bulan" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
        {mode === 'year' && (
          <Select onValueChange={(v) => { setYear(v); setPage(1) }}>
            <SelectTrigger className="h-10 border-border">
              <SelectValue placeholder="Pilih tahun" />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Mobile Export Button */}
      <div className="px-4 mb-4 md:hidden">
        <Button
          onClick={handleExport}
          disabled={isExporting || (mode !== 'day' && mode !== 'month') || (mode === 'day' && !day) || (mode === 'month' && (!month || !monthNum))}
          className="w-full bg-primary hover:bg-primary/90 text-white h-11 rounded-xl gap-2 font-medium shadow-sm"
        >
          {isExporting ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
          {isExporting ? 'Mengekspor...' : 'Export Laporan'}
        </Button>
      </div>

      {/* Transaction list — Google Sheets style */}
      <div className="px-4">
        <div className="rounded-2xl border border-border bg-white overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => (
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
          ) : !data?.data.length ? (
            <EmptyState
              icon={Receipt}
              title="Tidak ada data"
              description="Tidak ada setoran yang cocok dengan filter ini"
            />
          ) : (
            <div className="divide-y divide-border">
              {data.data.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  tx={tx}
                  onEdit={() => navigate(`/edit/${tx.id}`)}
                  onDelete={() => setDeleteId(tx.id)}
                  onViewDetail={() => navigate(`/history/${tx.id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between py-4">
            <span className="text-xs text-muted-foreground">
              {data.total} total · halaman {page} dari {data.totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 p-0 border-border"
              >
                <ChevronLeft size={14} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="w-8 h-8 p-0 border-border"
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Hapus setoran?"
        description="Data setoran akan dihapus permanen."
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
