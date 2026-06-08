import { supabase } from '@/lib/supabase'
import type { Target } from '@/types'

const mapTarget = (data: any): Target => {
  return {
    ...data,
    targetAmount: data.target_amount,
    createdAt: data.created_at,
  } as any as Target
}

export const targetService = {
  async getAll(): Promise<Target[]> {
    const { data, error } = await supabase
      .from('targets')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(mapTarget)
  },

  async getById(id: number): Promise<Target> {
    const { data, error } = await supabase
      .from('targets')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return mapTarget(data)
  },

  async create(payload: {
    title: string
    targetAmount: number
    description?: string | null
  }): Promise<Target> {
    const snakeCasePayload = {
      title: payload.title,
      target_amount: payload.targetAmount,
      description: payload.description,
    }

    const { data, error } = await supabase
      .from('targets')
      .insert(snakeCasePayload)
      .select()
      .single()

    if (error) throw error
    return mapTarget(data)
  },

  async update(
    id: number,
    payload: Partial<{ title: string; targetAmount: number; description: string | null }>
  ): Promise<Target> {
    const snakeCasePayload: any = {}
    if (payload.title !== undefined) snakeCasePayload.title = payload.title
    if (payload.targetAmount !== undefined) snakeCasePayload.target_amount = payload.targetAmount
    if (payload.description !== undefined) snakeCasePayload.description = payload.description

    const { data, error } = await supabase
      .from('targets')
      .update(snakeCasePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return mapTarget(data)
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('targets')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}
