import { useState } from 'react'
import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { exportService } from '@/services/statsService'
import { FileText, CalendarDays, Calendar } from 'lucide-react'
import { MONTHS, YEARS } from '@/utils/date'
import { toast } from 'sonner'

export default function ExportPage() {
  const [dailyDate, setDailyDate] = useState('')
  const [monthlyYear, setMonthlyYear] = useState('')
  const [monthlyMonth, setMonthlyMonth] = useState('')

  const [isExportingDaily, setIsExportingDaily] = useState(false)
  const [isExportingMonthly, setIsExportingMonthly] = useState(false)

  const handleExportDaily = async () => {
    if (!dailyDate) {
      toast.error('Pilih tanggal terlebih dahulu')
      return
    }
    setIsExportingDaily(true)
    const toastId = toast.loading('Sedang mengunduh laporan harian...')
    try {
      await exportService.downloadDailyPDF(dailyDate)
      toast.success('Laporan berhasil diunduh!', { id: toastId })
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengunduh laporan', { id: toastId })
    } finally {
      setIsExportingDaily(false)
    }
  }

  const handleExportMonthly = async () => {
    if (!monthlyYear || !monthlyMonth) {
      toast.error('Pilih tahun dan bulan terlebih dahulu')
      return
    }
    setIsExportingMonthly(true)
    const toastId = toast.loading('Sedang mengunduh laporan bulanan...')
    try {
      await exportService.downloadMonthlyPDF(monthlyYear, monthlyMonth)
      toast.success('Laporan berhasil diunduh!', { id: toastId })
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengunduh laporan', { id: toastId })
    } finally {
      setIsExportingMonthly(false)
    }
  }

  return (
    <div className="min-h-dvh bg-background">
      <PageHeader title="Ekspor Laporan" subtitle="Unduh laporan setoran dalam format PDF" />

      <div className="px-4 space-y-4 pb-4">
        {/* Daily Export */}
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-[#4285F4]/10 flex items-center justify-center flex-shrink-0">
              <CalendarDays size={20} className="text-primary" strokeWidth={2} />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Laporan Harian</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Semua setoran dalam satu hari</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="dailyDate" className="text-sm font-medium text-foreground">Pilih Tanggal</Label>
              <Input
                id="dailyDate"
                type="date"
                value={dailyDate}
                onChange={(e) => setDailyDate(e.target.value)}
                className="h-11 border-border focus-visible:ring-primary"
              />
            </div>
            <Button
              onClick={handleExportDaily}
              disabled={isExportingDaily}
              className="w-full bg-primary hover:bg-primary/90 text-white h-11 rounded-xl gap-2 font-medium disabled:opacity-50"
            >
              <FileText size={16} /> {isExportingDaily ? 'Sedang Mengunduh...' : 'Unduh PDF'}
            </Button>
          </div>
        </div>

        {/* Monthly Export */}
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-[#34A853]/10 flex items-center justify-center flex-shrink-0">
              <Calendar size={20} className="text-[#34A853]" strokeWidth={2} />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Laporan Bulanan</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Semua setoran dalam satu bulan</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">Tahun</Label>
                <Select onValueChange={setMonthlyYear}>
                  <SelectTrigger id="monthlyYear" className="h-11 border-border focus:ring-primary">
                    <SelectValue placeholder="Tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => (
                      <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">Bulan</Label>
                <Select onValueChange={setMonthlyMonth}>
                  <SelectTrigger id="monthlyMonth" className="h-11 border-border focus:ring-primary">
                    <SelectValue placeholder="Bulan" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={handleExportMonthly}
              disabled={isExportingMonthly}
              className="w-full bg-[#34A853] hover:bg-[#34A853]/90 text-white h-11 rounded-xl gap-2 font-medium disabled:opacity-50"
            >
              <FileText size={16} /> {isExportingMonthly ? 'Sedang Mengunduh...' : 'Unduh PDF'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
