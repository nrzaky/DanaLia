import api from '@/lib/api'
import type { Target } from '@/types'

export const targetService = {
  async getAll(): Promise<Target[]> {
    const { data } = await api.get('/targets')
    return data
  },

  async getById(id: number): Promise<Target> {
    const { data } = await api.get(`/targets/${id}`)
    return data
  },

  async create(payload: {
    title: string
    targetAmount: number
    description?: string | null
  }): Promise<Target> {
    const { data } = await api.post('/targets', payload)
    return data
  },

  async update(
    id: number,
    payload: Partial<{ title: string; targetAmount: number; description: string | null }>
  ): Promise<Target> {
    const { data } = await api.put(`/targets/${id}`, payload)
    return data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/targets/${id}`)
  },
}
