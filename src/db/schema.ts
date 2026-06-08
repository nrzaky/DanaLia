import { pgTable, serial, integer, varchar, text, timestamp, decimal, uuid } from 'drizzle-orm/pg-core'

// ============================================================
// users
// ============================================================
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 100 }).unique().notNull(),
  email: varchar('email', { length: 255 }).unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: varchar('full_name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ============================================================
// transactions
// ============================================================
export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  amount: integer('amount').notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(),
  proofUrl: text('proof_url'),
  depositMessage: text('deposit_message'),
  transactionDate: timestamp('transaction_date').notNull(),
  transactionType: varchar('transaction_type', { length: 20 }).notNull().default('DEPOSIT'),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
  deletedBy: uuid('deleted_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
  deletedAt: timestamp('deleted_at'),
})

// ============================================================
// targets
// ============================================================
export const targets = pgTable('targets', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  targetAmount: integer('target_amount').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ============================================================
// gallery_photos
// ============================================================
export const galleryPhotos = pgTable('gallery_photos', {
  id: serial('id').primaryKey(),
  imageUrl: text('image_url').notNull(),
  caption: text('caption'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ============================================================
// activity_logs
// ============================================================
export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: varchar('entity_id', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ============================================================
// ============================================================
export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert

export type Target = typeof targets.$inferSelect
export type NewTarget = typeof targets.$inferInsert

export type GalleryPhoto = typeof galleryPhotos.$inferSelect
export type NewGalleryPhoto = typeof galleryPhotos.$inferInsert

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type ActivityLog = typeof activityLogs.$inferSelect
export type NewActivityLog = typeof activityLogs.$inferInsert
