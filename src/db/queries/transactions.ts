import { db } from '../index'
import { transactions, type NewTransaction } from '../schema'
import { eq, sql, desc, ilike, and, gte, lte, between, isNull } from 'drizzle-orm'

export async function getTotalSavings() {
  const result = await db
    .select({ 
      totalSavings: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.transactionType} = 'DEPOSIT' THEN ${transactions.amount} ELSE -${transactions.amount} END), 0)`,
      totalDeposits: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.transactionType} = 'DEPOSIT' THEN ${transactions.amount} ELSE 0 END), 0)`,
      totalWithdrawals: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.transactionType} = 'WITHDRAWAL' THEN ${transactions.amount} ELSE 0 END), 0)`,
      transactionCount: sql<number>`COUNT(*)`,
    })
    .from(transactions)
    .where(isNull(transactions.deletedAt))
    
  return {
    totalSavings: Number(result[0]?.totalSavings ?? 0),
    totalDeposits: Number(result[0]?.totalDeposits ?? 0),
    totalWithdrawals: Number(result[0]?.totalWithdrawals ?? 0),
    transactionCount: Number(result[0]?.transactionCount ?? 0),
  }
}

export async function getLatestTransactions(limit = 3) {
  return db
    .select()
    .from(transactions)
    .where(isNull(transactions.deletedAt))
    .orderBy(desc(transactions.transactionDate))
    .limit(limit)
}

export interface TransactionFilter {
  search?: string
  day?: string   // 'YYYY-MM-DD'
  month?: string // 'YYYY-MM'
  year?: string  // 'YYYY'
  page?: number
  limit?: number
}

export async function getTransactions(filter: TransactionFilter = {}) {
  const { search, day, month, year, page = 1, limit = 10 } = filter
  const offset = (page - 1) * limit

  const conditions: any[] = [isNull(transactions.deletedAt)]

  if (search) {
    conditions.push(
      ilike(transactions.depositMessage, `%${search}%`) as any
    )
  }

  if (day) {
    const start = new Date(day)
    const end = new Date(day)
    end.setDate(end.getDate() + 1)
    conditions.push(
      and(
        gte(transactions.transactionDate, start),
        lte(transactions.transactionDate, end)
      ) as any
    )
  } else if (month) {
    const [y, m] = month.split('-').map(Number)
    const start = new Date(y, m - 1, 1)
    const end = new Date(y, m, 1)
    conditions.push(
      and(
        gte(transactions.transactionDate, start),
        lte(transactions.transactionDate, end)
      ) as any
    )
  } else if (year) {
    const y = Number(year)
    const start = new Date(y, 0, 1)
    const end = new Date(y + 1, 0, 1)
    conditions.push(
      and(
        gte(transactions.transactionDate, start),
        lte(transactions.transactionDate, end)
      ) as any
    )
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [rows, countResult] = await Promise.all([
    db
      .select()
      .from(transactions)
      .where(where)
      .orderBy(desc(transactions.transactionDate))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(transactions)
      .where(where),
  ])

  return {
    data: rows,
    total: Number(countResult[0]?.count ?? 0),
    page,
    limit,
    totalPages: Math.ceil(Number(countResult[0]?.count ?? 0) / limit),
  }
}

export async function getTransactionsByDay(date: string) {
  const start = new Date(date)
  const end = new Date(date)
  end.setDate(end.getDate() + 1)
  return db
    .select()
    .from(transactions)
    .where(and(gte(transactions.transactionDate, start), lte(transactions.transactionDate, end), isNull(transactions.deletedAt)))
    .orderBy(desc(transactions.transactionDate))
}

export async function getTransactionsByMonth(year: number, month: number) {
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 1)
  return db
    .select()
    .from(transactions)
    .where(and(gte(transactions.transactionDate, start), lte(transactions.transactionDate, end), isNull(transactions.deletedAt)))
    .orderBy(desc(transactions.transactionDate))
}

export async function getTransactionById(id: number) {
  const rows = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, id), isNull(transactions.deletedAt)))
  return rows[0] ?? null
}

export async function createTransaction(data: NewTransaction) {
  const rows = await db.insert(transactions).values(data).returning()
  return rows[0]
}

export async function updateTransaction(id: number, data: Partial<NewTransaction>) {
  const rows = await db
    .update(transactions)
    .set(data)
    .where(eq(transactions.id, id))
    .returning()
  return rows[0]
}

export async function deleteTransaction(id: number, userId: string) {
  await db
    .update(transactions)
    .set({ deletedAt: sql`NOW()`, deletedBy: userId })
    .where(eq(transactions.id, id))
}
