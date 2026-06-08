import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import multer from 'multer'
import { IncomingMessage, ServerResponse } from 'http'

import {
  getTransactions,
  getLatestTransactions,
  getTotalSavings,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsByDay,
  getTransactionsByMonth,
} from '../src/db/queries/transactions'
import { getActivities, logActivity } from '../src/db/queries/activity'
import { getAllTargets, getTargetById, createTarget, updateTarget, deleteTarget } from '../src/db/queries/targets'
import {
  getAllGalleryPhotos,
  getRecentGalleryPhotos,
  getGalleryPhotoById,
  createGalleryPhoto,
  updateGalleryPhoto,
  deleteGalleryPhoto,
} from '../src/db/queries/gallery'
import { uploadToCloudinary } from './services/cloudinary'
import { syncTransactionToSheets } from './services/sheets'
import { buildDailyPDF, buildMonthlyPDF } from './services/pdf'
import { authRouter } from './routes/auth'
import { authMiddleware } from './middleware/auth'

// ──────────────────────────────────────────────
// Multer for multipart/form-data file uploads
// ──────────────────────────────────────────────
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

export type AppEnv = {
  Variables: {
    user: any
  }
}

const app = new Hono<AppEnv>()

app.use('*', logger())
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', process.env.VITE_API_BASE_URL || 'http://localhost:3001'],
  credentials: true,
}))

// ═══════════════════════════════════════════
// Auth Middleware & Routes
// ═══════════════════════════════════════════
app.route('/api/auth', authRouter)

app.use('/api/*', async (c, next) => {
  // Allow public access to health check and login
  if (c.req.path === '/api/health' || c.req.path === '/api/auth/login') {
    return next()
  }
  return authMiddleware(c, next)
})

// ═══════════════════════════════════════════
// Health
// ═══════════════════════════════════════════
app.get('/api/health', (c) => c.json({ ok: true }))

// ═══════════════════════════════════════════
// Stats
// ═══════════════════════════════════════════
app.get('/api/stats', async (c) => {
  const stats = await getTotalSavings()
  return c.json(stats)
})

// ═══════════════════════════════════════════
// Transactions
// ═══════════════════════════════════════════
app.get('/api/transactions', async (c) => {
  const { search, day, month, year, page, limit } = c.req.query()
  const result = await getTransactions({
    search,
    day,
    month,
    year,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 10,
  })
  return c.json(result)
})

app.get('/api/transactions/latest', async (c) => {
  const rows = await getLatestTransactions(3)
  return c.json(rows)
})

app.get('/api/transactions/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const row = await getTransactionById(id)
  if (!row) return c.json({ error: 'Not found' }, 404)
  return c.json(row)
})

app.post('/api/transactions', async (c) => {
  const body = await c.req.json()
  const user = c.get('user') as any
  
  if (body.transactionType === 'WITHDRAWAL') {
    const stats = await getTotalSavings()
    if (stats.totalSavings < Number(body.amount)) {
      return c.json({ error: 'Insufficient balance' }, 400)
    }
  }

  const row = await createTransaction({
    amount: Number(body.amount),
    paymentMethod: body.paymentMethod,
    proofUrl: body.proofUrl ?? null,
    depositMessage: body.depositMessage ?? null,
    transactionDate: new Date(body.transactionDate),
    transactionType: body.transactionType ?? 'DEPOSIT',
    createdBy: user.id,
  })
  
  await logActivity({
    userId: user.id,
    action: `Created ${row.transactionType}`,
    entityType: 'TRANSACTION',
    entityId: String(row.id),
    description: `Created transaction of amount ${row.amount}`,
  })
  
  await syncTransactionToSheets('create', row)
  return c.json(row, 201)
})

app.put('/api/transactions/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const body = await c.req.json()
  const user = c.get('user') as any
  
  const row = await updateTransaction(id, {
    amount: body.amount !== undefined ? Number(body.amount) : undefined,
    paymentMethod: body.paymentMethod,
    proofUrl: body.proofUrl,
    depositMessage: body.depositMessage,
    transactionDate: body.transactionDate ? new Date(body.transactionDate) : undefined,
    transactionType: body.transactionType,
    updatedBy: user.id,
    updatedAt: new Date(),
  })
  if (!row) return c.json({ error: 'Not found' }, 404)
    
  await logActivity({
    userId: user.id,
    action: `Updated Transaction`,
    entityType: 'TRANSACTION',
    entityId: String(row.id),
    description: `Updated transaction #${row.id}`,
  })
  
  await syncTransactionToSheets('update', row)
  return c.json(row)
})

app.delete('/api/transactions/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const user = c.get('user') as any
  const row = await getTransactionById(id)
  if (!row) return c.json({ error: 'Not found' }, 404)
  
  await deleteTransaction(id, user.id)
  
  await logActivity({
    userId: user.id,
    action: `Deleted Transaction`,
    entityType: 'TRANSACTION',
    entityId: String(id),
    description: `Soft deleted transaction #${id}`,
  })
  
  await syncTransactionToSheets('delete', row)
  return c.json({ success: true })
})

// ═══════════════════════════════════════════
// Targets
// ═══════════════════════════════════════════
app.get('/api/targets', async (c) => {
  const rows = await getAllTargets()
  return c.json(rows)
})

app.get('/api/targets/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const row = await getTargetById(id)
  if (!row) return c.json({ error: 'Not found' }, 404)
  return c.json(row)
})

app.post('/api/targets', async (c) => {
  const body = await c.req.json()
  const row = await createTarget({
    title: body.title,
    targetAmount: Number(body.targetAmount),
    description: body.description ?? null,
  })
  return c.json(row, 201)
})

app.put('/api/targets/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const body = await c.req.json()
  const row = await updateTarget(id, {
    title: body.title,
    targetAmount: body.targetAmount !== undefined ? Number(body.targetAmount) : undefined,
    description: body.description,
  })
  if (!row) return c.json({ error: 'Not found' }, 404)
  return c.json(row)
})

app.delete('/api/targets/:id', async (c) => {
  const id = Number(c.req.param('id'))
  await deleteTarget(id)
  return c.json({ success: true })
})

// ═══════════════════════════════════════════
// Gallery
// ═══════════════════════════════════════════
app.get('/api/gallery', async (c) => {
  const { limit } = c.req.query()
  const rows = limit ? await getRecentGalleryPhotos(Number(limit)) : await getAllGalleryPhotos()
  return c.json(rows)
})

app.get('/api/gallery/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const row = await getGalleryPhotoById(id)
  if (!row) return c.json({ error: 'Not found' }, 404)
  return c.json(row)
})

app.delete('/api/gallery/:id', async (c) => {
  const id = Number(c.req.param('id'))
  await deleteGalleryPhoto(id)
  return c.json({ success: true })
})

app.put('/api/gallery/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const body = await c.req.json()
  const row = await updateGalleryPhoto(id, { caption: body.caption })
  if (!row) return c.json({ error: 'Not found' }, 404)
  return c.json(row)
})

// ═══════════════════════════════════════════
// Upload (Cloudinary) — uses raw node adapter
// ═══════════════════════════════════════════
app.post('/api/upload', async (c) => {
  // Use multer via raw node request
  const raw = c.env as { incoming: IncomingMessage; outgoing: ServerResponse }
  const req = raw?.incoming ?? (c.req.raw as any)

  return new Promise<Response>((resolve) => {
    upload.single('file')(req as any, {} as any, async (err) => {
      if (err) {
        resolve(c.json({ error: err.message }, 400) as any)
        return
      }
      const file = (req as any).file as Express.Multer.File | undefined
      if (!file) {
        resolve(c.json({ error: 'No file provided' }, 400) as any)
        return
      }
      try {
        const folder = (req as any).body?.folder ?? 'tabungan-lia'
        const url = await uploadToCloudinary(file.buffer, folder)
        resolve(c.json({ url }) as any)
      } catch (uploadErr: any) {
        resolve(c.json({ error: uploadErr.message }, 500) as any)
      }
    })
  })
})

// ═══════════════════════════════════════════
// Gallery Upload (combined: upload + save)
// ═══════════════════════════════════════════
app.post('/api/gallery', async (c) => {
  const raw = c.env as { incoming: IncomingMessage; outgoing: ServerResponse }
  const req = raw?.incoming ?? (c.req.raw as any)

  return new Promise<Response>((resolve) => {
    upload.single('file')(req as any, {} as any, async (err) => {
      if (err) {
        resolve(c.json({ error: err.message }, 400) as any)
        return
      }

      const body = (req as any).body ?? {}
      let imageUrl: string

      if ((req as any).file) {
        try {
          imageUrl = await uploadToCloudinary((req as any).file.buffer, 'tabungan-lia/gallery')
        } catch (uploadErr: any) {
          resolve(c.json({ error: uploadErr.message }, 500) as any)
          return
        }
      } else if (body.imageUrl) {
        imageUrl = body.imageUrl
      } else {
        resolve(c.json({ error: 'No file or imageUrl provided' }, 400) as any)
        return
      }

      const row = await createGalleryPhoto({
        imageUrl,
        caption: body.caption ?? null,
      })
      resolve(c.json(row, 201) as any)
    })
  })
})

// ═══════════════════════════════════════════
// Transaction Upload + Save
// ═══════════════════════════════════════════
app.post('/api/transactions/with-proof', async (c) => {
  const raw = c.env as { incoming: IncomingMessage; outgoing: ServerResponse }
  const req = raw?.incoming ?? (c.req.raw as any)
  const user = c.get('user') as any

  return new Promise<Response>((resolve) => {
    upload.single('proof')(req as any, {} as any, async (err) => {
      if (err) {
        resolve(c.json({ error: err.message }, 400) as any)
        return
      }
      const body = (req as any).body ?? {}
      let proofUrl: string | null = null

      if (body.transactionType === 'WITHDRAWAL') {
        const stats = await getTotalSavings()
        if (stats.totalSavings < Number(body.amount)) {
          resolve(c.json({ error: 'Insufficient balance' }, 400) as any)
          return
        }
      }

      if ((req as any).file) {
        try {
          proofUrl = await uploadToCloudinary((req as any).file.buffer, 'tabungan-lia/proofs')
        } catch (uploadErr: any) {
          resolve(c.json({ error: uploadErr.message }, 500) as any)
          return
        }
      }

      const row = await createTransaction({
        amount: Number(body.amount),
        paymentMethod: body.paymentMethod,
        proofUrl,
        depositMessage: body.depositMessage ?? null,
        transactionDate: new Date(body.transactionDate),
        transactionType: body.transactionType ?? 'DEPOSIT',
        createdBy: user.id,
      })
      
      await logActivity({
        userId: user.id,
        action: `Created ${row.transactionType} with proof`,
        entityType: 'TRANSACTION',
        entityId: String(row.id),
        description: `Created transaction of amount ${row.amount}`,
      })
      
      await syncTransactionToSheets('create', row)
      resolve(c.json(row, 201) as any)
    })
  })
})

// ═══════════════════════════════════════════
// PDF Export
// ═══════════════════════════════════════════
app.get('/api/export/pdf/daily', async (c) => {
  const { date } = c.req.query()
  if (!date) return c.json({ error: 'date param required (YYYY-MM-DD)' }, 400)
  const rows = await getTransactionsByDay(date)
  const pdfBuffer = buildDailyPDF(date, rows)
  c.header('Content-Type', 'application/pdf')
  c.header('Content-Disposition', `attachment; filename="tabungan-lia-daily-${date}.pdf"`)
  return c.body(pdfBuffer as any)
})

app.get('/api/export/pdf/monthly', async (c) => {
  const { year, month } = c.req.query()
  if (!year || !month) return c.json({ error: 'year and month params required' }, 400)
  const rows = await getTransactionsByMonth(Number(year), Number(month))
  const pdfBuffer = buildMonthlyPDF(Number(year), Number(month), rows)
  c.header('Content-Type', 'application/pdf')
  c.header('Content-Disposition', `attachment; filename="tabungan-lia-${year}-${month}.pdf"`)
  return c.body(pdfBuffer as any)
})

// ═══════════════════════════════════════════
// Activity Log
// ═══════════════════════════════════════════
app.get('/api/activity', async (c) => {
  const { userId, action, date, page, limit } = c.req.query()
  const rows = await getActivities({
    userId,
    action,
    date,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 50,
  })
  return c.json(rows)
})

// ═══════════════════════════════════════════
// Start
// ═══════════════════════════════════════════
const PORT = Number(process.env.PORT ?? 3001)

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`🌸 Tabungan Lia API running at http://localhost:${PORT}`)
})
