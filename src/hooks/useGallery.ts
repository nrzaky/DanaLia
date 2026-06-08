import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { galleryService } from '@/services/galleryService'

export const GALLERY_KEYS = {
  all: ['gallery'] as const,
  lists: () => [...GALLERY_KEYS.all, 'list'] as const,
  recent: (limit: number) => [...GALLERY_KEYS.all, 'recent', limit] as const,
}

export function useGallery() {
  return useQuery({
    queryKey: GALLERY_KEYS.lists(),
    queryFn: galleryService.getAll,
  })
}

export function useRecentGallery(limit = 6) {
  return useQuery({
    queryKey: GALLERY_KEYS.recent(limit),
    queryFn: () => galleryService.getRecent(limit),
  })
}

export function useUploadPhoto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ file, caption }: { file: File; caption?: string }) =>
      galleryService.upload(file, caption),
    onSuccess: () => qc.invalidateQueries({ queryKey: GALLERY_KEYS.all }),
  })
}

export function useUpdateCaption() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, caption }: { id: number; caption: string }) =>
      galleryService.updateCaption(id, caption),
    onSuccess: () => qc.invalidateQueries({ queryKey: GALLERY_KEYS.all }),
  })
}

export function useDeletePhoto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: galleryService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: GALLERY_KEYS.all }),
  })
}
