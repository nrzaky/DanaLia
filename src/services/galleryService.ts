import { supabase } from '@/lib/supabase'
import type { GalleryPhoto } from '@/types'

// Helper for cloudinary signature
const generateSignature = async (params: Record<string, string>, apiSecret: string) => {
  const sortedKeys = Object.keys(params).sort()
  const signatureString = sortedKeys.map(k => `${k}=${params[k]}`).join('&') + apiSecret
  const msgBuffer = new TextEncoder().encode(signatureString)
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

const mapPhoto = (data: any): GalleryPhoto => {
  return {
    ...data,
    imageUrl: data.image_url,
    createdAt: data.created_at,
  } as any as GalleryPhoto
}

export const galleryService = {
  async getAll(): Promise<GalleryPhoto[]> {
    const { data, error } = await supabase
      .from('gallery_photos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(mapPhoto)
  },

  async getRecent(limit = 6): Promise<GalleryPhoto[]> {
    const { data, error } = await supabase
      .from('gallery_photos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return (data || []).map(mapPhoto)
  },

  async upload(file: File, caption?: string): Promise<GalleryPhoto> {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY
    const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET

    const timestamp = Math.round(new Date().getTime() / 1000).toString()
    const folder = 'tabungan-lia/gallery'

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

    const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!uploadResponse.ok) {
      const err = await uploadResponse.json()
      throw new Error(err.error?.message || 'Upload to Cloudinary failed')
    }

    const uploadData = await uploadResponse.json()
    const imageUrl = uploadData.secure_url

    const { data, error } = await supabase
      .from('gallery_photos')
      .insert({
        image_url: imageUrl,
        caption: caption || null,
      })
      .select()
      .single()

    if (error) throw error
    return mapPhoto(data)
  },

  async updateCaption(id: number, caption: string): Promise<GalleryPhoto> {
    const { data, error } = await supabase
      .from('gallery_photos')
      .update({ caption })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return mapPhoto(data)
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('gallery_photos')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}
