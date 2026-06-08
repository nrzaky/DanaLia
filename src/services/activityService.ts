import api from '@/lib/api'
import type { ActivityLog } from '@/types'

export const activityService = {
  async getActivities(params?: { userId?: string; action?: string; date?: string; page?: number; limit?: number }) {
    const { data } = await api.get('/activity', { params })
    return data as ActivityLog[]
  },
}
