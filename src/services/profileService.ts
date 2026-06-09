import { supabase } from '@/lib/supabase'

const generateSignature = async (params: Record<string, string>, apiSecret: string) => {
  const sortedKeys = Object.keys(params).sort()
  const signatureString = sortedKeys.map(k => `${k}=${params[k]}`).join('&') + apiSecret
  const msgBuffer = new TextEncoder().encode(signatureString)
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export const profileService = {
  async uploadAvatar(file: File, userId: string): Promise<string> {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY
    const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary credentials are not configured.')
    }

    const timestamp = Math.round(new Date().getTime() / 1000).toString()
    const folder = 'tabungan-lia/avatars'

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

    // Update profile
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: imageUrl })
      .eq('id', userId)

    if (error) throw error

    return imageUrl
  }
}
