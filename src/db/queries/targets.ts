import { db } from '../index'
import { targets, type NewTarget } from '../schema'
import { eq, asc } from 'drizzle-orm'

export async function getAllTargets() {
  return db.select().from(targets).orderBy(asc(targets.createdAt))
}

export async function getTargetById(id: number) {
  const rows = await db.select().from(targets).where(eq(targets.id, id))
  return rows[0] ?? null
}

export async function createTarget(data: NewTarget) {
  const rows = await db.insert(targets).values(data).returning()
  return rows[0]
}

export async function updateTarget(id: number, data: Partial<NewTarget>) {
  const rows = await db
    .update(targets)
    .set(data)
    .where(eq(targets.id, id))
    .returning()
  return rows[0]
}

export async function deleteTarget(id: number) {
  await db.delete(targets).where(eq(targets.id, id))
}
