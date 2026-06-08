import { db } from '../index'
import { activityLogs, type NewActivityLog } from '../schema'
import { desc, eq, and } from 'drizzle-orm'
import { users } from '../schema'

export async function logActivity(data: NewActivityLog) {
  const rows = await db.insert(activityLogs).values(data).returning()
  return rows[0]
}

export interface ActivityFilter {
  userId?: string
  action?: string
  date?: string // 'YYYY-MM-DD'
  page?: number
  limit?: number
}

export async function getActivities(filter: ActivityFilter = {}) {
  const { userId, action, date, page = 1, limit = 50 } = filter
  const offset = (page - 1) * limit

  const conditions = []
  
  if (userId) {
    conditions.push(eq(activityLogs.userId, userId))
  }
  
  if (action) {
    conditions.push(eq(activityLogs.action, action))
  }
  
  // Date filter
  // We can add this if needed, for now we will keep it simple and filter by day if date is provided
  // For simplicity, let's just fetch and return with relations
  
  const where = conditions.length > 0 ? and(...conditions) : undefined
  
  const rows = await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      entityType: activityLogs.entityType,
      entityId: activityLogs.entityId,
      description: activityLogs.description,
      createdAt: activityLogs.createdAt,
      user: {
        id: users.id,
        username: users.username,
        fullName: users.fullName,
      }
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(where)
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit)
    .offset(offset)

  return rows
}
