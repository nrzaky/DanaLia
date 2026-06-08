export interface Transaction {
  id: number
  amount: number
  paymentMethod: string
  proofUrl: string | null
  depositMessage: string | null
  transactionDate: string
  transactionType: 'DEPOSIT' | 'WITHDRAWAL'
  createdBy: string
  updatedBy: string | null
  deletedBy: string | null
  createdAt: string
  updatedAt: string | null
  deletedAt: string | null
}

export interface Target {
  id: number
  title: string
  targetAmount: number
  description: string | null
  createdAt: string
}

export interface GalleryPhoto {
  id: number
  imageUrl: string
  caption: string | null
  createdAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface Stats {
  totalSavings: number
  totalDeposits?: number
  totalWithdrawals?: number
  transactionCount?: number
}

export interface ActivityLog {
  id: string
  userId: string
  action: string
  entityType: string
  entityId: string
  description: string | null
  createdAt: string
  user?: {
    id: string
    username: string
    fullName: string | null
  }
}

export type PaymentMethod = 'Transfer Bank' | 'QRIS' | 'Tunai' | 'E-Wallet'

export const PAYMENT_METHODS: PaymentMethod[] = ['Transfer Bank', 'QRIS', 'Tunai', 'E-Wallet']
