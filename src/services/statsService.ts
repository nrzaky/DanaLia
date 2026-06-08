import api from '@/lib/api'
import type { Stats } from '@/types'

export const statsService = {
  async getStats(): Promise<Stats> {
    const { data } = await api.get('/stats')
    return data
  },
}

export const exportService = {
  downloadDailyPDF(date: string): void {
    const url = `/api/export/pdf/daily?date=${date}`
    window.open(url, '_blank')
  },

  downloadMonthlyPDF(year: string, month: string): void {
    const url = `/api/export/pdf/monthly?year=${year}&month=${month}`
    window.open(url, '_blank')
  },
}
