import type { ActivityLog } from '@/types'

export const activityService = {
  async getActivities(params?: { userId?: string; action?: string; date?: string; page?: number; limit?: number }) {
    // Activity logs were not present in the migrated schema, returning empty for now
    // If needed, we can add an activity_logs table to Supabase and query it here.
    return [] as ActivityLog[]
  },
}
