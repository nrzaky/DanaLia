import api from '@/lib/api'
import type { GalleryPhoto } from '@/types'

export const galleryService = {
  async getAll(): Promise<GalleryPhoto[]> {
    const { data } = await api.get('/gallery')
    return data
  },

  async getRecent(limit = 6): Promise<GalleryPhoto[]> {
    const { data } = await api.get(`/gallery?limit=${limit}`)
    return data
  },

  async upload(file: File, caption?: string): Promise<GalleryPhoto> {
    const formData = new FormData()
    formData.append('file', file)
    if (caption) formData.append('caption', caption)
    const { data } = await api.post('/gallery', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async updateCaption(id: number, caption: string): Promise<GalleryPhoto> {
    const { data } = await api.put(`/gallery/${id}`, { caption })
    return data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/gallery/${id}`)
  },
}
