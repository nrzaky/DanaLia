import { supabase } from '@/lib/supabase'
import type { Transaction, PaginatedResponse } from '@/types'

export interface TransactionFilter {
  search?: string
  day?: string
  month?: string
  year?: string
  page?: number
  limit?: number
}

const generateSignature = async (params: Record<string, string>, apiSecret: string) => {
  const sortedKeys = Object.keys(params).sort()
  const signatureString = sortedKeys.map(k => `${k}=${params[k]}`).join('&') + apiSecret
  const msgBuffer = new TextEncoder().encode(signatureString)
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

const mapTransaction = (data: any): Transaction => {
  return {
    ...data,
    transactionType: data.amount >= 0 ? 'DEPOSIT' : 'WITHDRAWAL',
    paymentMethod: data.payment_method,
    proofUrl: data.proof_url,
    depositMessage: data.deposit_message,
    transactionDate: data.transaction_date,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    createdBy: data.created_by,
    updatedBy: data.updated_by,
    deletedAt: data.deleted_at,
    deletedBy: data.deleted_by,
  } as any as Transaction
}

export const transactionService = {
  async getAll(filter: TransactionFilter = {}): Promise<PaginatedResponse<Transaction>> {
    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .order('transaction_date', { ascending: false })

    if (filter.search) {
      query = query.or(`deposit_message.ilike.%${filter.search}%,payment_method.ilike.%${filter.search}%`)
    }

    if (filter.year) {
      const year = parseInt(filter.year)
      const startDate = new Date(year, 0, 1).toISOString()
      const endDate = new Date(year + 1, 0, 1).toISOString()
      query = query.gte('transaction_date', startDate).lt('transaction_date', endDate)
    } else if (filter.month) {
      const date = new Date(filter.month)
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1).toISOString()
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString()
      query = query.gte('transaction_date', startDate).lt('transaction_date', endDate)
    } else if (filter.day) {
      const date = new Date(filter.day)
      const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString()
      const endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).toISOString()
      query = query.gte('transaction_date', startDate).lt('transaction_date', endDate)
    }

    const page = filter.page || 1
    const limit = filter.limit || 10
    const from = (page - 1) * limit
    const to = from + limit - 1

    query = query.range(from, to)

    const { data, count, error } = await query

    if (error) throw error

    return {
      data: (data || []).map(mapTransaction),
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    }
  },

  async getLatest(limit = 3): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('transaction_date', { ascending: false })
      .limit(limit)

    if (error) throw error
    return (data || []).map(mapTransaction)
  },

  async getById(id: number): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return mapTransaction(data)
  },

  async create(payload: {
    amount: number
    transactionType: 'DEPOSIT' | 'WITHDRAWAL'
    paymentMethod: string
    proofUrl?: string | null
    depositMessage?: string | null
    transactionDate: string
    createdBy?: string
  }): Promise<Transaction> {
    const amount = payload.transactionType === 'WITHDRAWAL' ? -Math.abs(payload.amount) : Math.abs(payload.amount)
    
    const snakeCasePayload: any = {
      amount: amount,
      payment_method: payload.paymentMethod,
      proof_url: payload.proofUrl,
      deposit_message: payload.depositMessage,
      transaction_date: payload.transactionDate,
    }

    if (payload.createdBy) {
      snakeCasePayload.created_by = payload.createdBy
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert(snakeCasePayload)
      .select()
      .single()

    if (error) throw error
    
    // Convert back to frontend structure
    return mapTransaction(data)
  },

  async createWithProof(formData: FormData): Promise<Transaction> {
    const file = formData.get('proof') as File
    let proofUrl = null

    if (file) {
      proofUrl = await this.uploadProof(file)
    }

    const payload = {
      amount: Number(formData.get('amount')),
      transactionType: formData.get('transactionType') as 'DEPOSIT' | 'WITHDRAWAL',
      paymentMethod: formData.get('paymentMethod') as string,
      depositMessage: formData.get('depositMessage') as string,
      transactionDate: formData.get('transactionDate') as string,
      createdBy: formData.get('createdBy') as string | undefined,
      proofUrl
    }

    return this.create(payload)
  },

  async update(
    id: number,
    payload: Partial<{
      amount: number
      transactionType: 'DEPOSIT' | 'WITHDRAWAL'
      paymentMethod: string
      proofUrl: string | null
      depositMessage: string | null
      transactionDate: string
    }>
  ): Promise<Transaction> {
    const snakeCasePayload: any = {}
    if (payload.amount !== undefined) {
       // If type is not provided, we can't reliably flip the amount unless we query first,
       // but assume the frontend passes both if amount is updated.
       const isWithdrawal = payload.transactionType === 'WITHDRAWAL'
       snakeCasePayload.amount = isWithdrawal ? -Math.abs(payload.amount) : Math.abs(payload.amount)
    }
    if (payload.paymentMethod !== undefined) snakeCasePayload.payment_method = payload.paymentMethod
    if (payload.proofUrl !== undefined) snakeCasePayload.proof_url = payload.proofUrl
    if (payload.depositMessage !== undefined) snakeCasePayload.deposit_message = payload.depositMessage
    if (payload.transactionDate !== undefined) snakeCasePayload.transaction_date = payload.transactionDate

    const { data, error } = await supabase
      .from('transactions')
      .update(snakeCasePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return mapTransaction(data)
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async uploadProof(file: File): Promise<string> {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY
    const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET

    const timestamp = Math.round(new Date().getTime() / 1000).toString()
    const folder = 'tabungan-lia/proofs'

    const paramsToSign = {
      folder,
      timestamp,
    }

    const signature = await generateSignature(paramsToSign, apiSecret)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    formData.append('timestamp', timestamp)
    formData.append('api_key', apiKey)
    formData.append('signature', signature)

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error?.message || 'Upload to Cloudinary failed')
    }

    const data = await response.json()
    return data.secure_url
  },
}
