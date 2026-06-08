import api from '@/lib/api'
import type { Transaction, PaginatedResponse } from '@/types'

export interface TransactionFilter {
  search?: string
  day?: string
  month?: string
  year?: string
  page?: number
  limit?: number
}

export const transactionService = {
  async getAll(filter: TransactionFilter = {}): Promise<PaginatedResponse<Transaction>> {
    const params = new URLSearchParams()
    if (filter.search) params.set('search', filter.search)
    if (filter.day) params.set('day', filter.day)
    if (filter.month) params.set('month', filter.month)
    if (filter.year) params.set('year', filter.year)
    if (filter.page) params.set('page', String(filter.page))
    if (filter.limit) params.set('limit', String(filter.limit))
    const { data } = await api.get(`/transactions?${params.toString()}`)
    return data
  },

  async getLatest(limit = 3): Promise<Transaction[]> {
    const { data } = await api.get('/transactions/latest')
    return data
  },

  async getById(id: number): Promise<Transaction> {
    const { data } = await api.get(`/transactions/${id}`)
    return data
  },

  async create(payload: {
    amount: number
    paymentMethod: string
    proofUrl?: string | null
    depositMessage?: string | null
    transactionDate: string
  }): Promise<Transaction> {
    const { data } = await api.post('/transactions', payload)
    return data
  },

  async createWithProof(formData: FormData): Promise<Transaction> {
    const { data } = await api.post('/transactions/with-proof', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async update(
    id: number,
    payload: Partial<{
      amount: number
      paymentMethod: string
      proofUrl: string | null
      depositMessage: string | null
      transactionDate: string
    }>
  ): Promise<Transaction> {
    const { data } = await api.put(`/transactions/${id}`, payload)
    return data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/transactions/${id}`)
  },

  async uploadProof(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'tabungan-lia/proofs')
    const { data } = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.url
  },
}
