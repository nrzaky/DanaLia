import { useState } from 'react'
import type { GalleryPhoto } from '@/types'
import PhotoPreviewModal from './PhotoPreviewModal'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { useDeletePhoto, useUpdateCaption } from '@/hooks/useGallery'
import { Trash2, Pencil, Check, X } from 'lucide-react'
import { toast } from 'sonner'

interface PhotoCardProps {
  photo: GalleryPhoto
}

export default function PhotoCard({ photo }: PhotoCardProps) {
  const [preview, setPreview] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [caption, setCaption] = useState(photo.caption ?? '')

  const deletePhoto = useDeletePhoto()
  const updateCaption = useUpdateCaption()

  const handleDelete = async () => {
    try {
      await deletePhoto.mutateAsync(photo.id)
      toast.success('Foto dihapus')
    } catch {
      toast.error('Gagal menghapus foto')
    } finally {
      setConfirmDelete(false)
    }
  }

  const handleSaveCaption = async () => {
    try {
      await updateCaption.mutateAsync({ id: photo.id, caption })
      setEditMode(false)
      toast.success('Keterangan diperbarui')
    } catch {
      toast.error('Gagal memperbarui keterangan')
    }
  }

  return (
    <>
      <div className="group relative overflow-hidden bg-muted cursor-pointer hover:opacity-95 transition-opacity duration-200">
        <div onClick={() => setPreview(true)}>
          <img
            src={photo.imageUrl}
            alt={photo.caption ?? 'foto'}
            className="w-full h-auto object-cover"
            loading="lazy"
          />
        </div>

        {/* Overlay actions (Google Photos style minimal overlay) */}
        <div className="absolute top-0 right-0 left-0 bg-gradient-to-b from-black/40 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex justify-end gap-2 pointer-events-none">
          <div className="pointer-events-auto flex gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); setEditMode(true) }}
              className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm flex items-center justify-center transition-colors"
              aria-label="Edit keterangan"
            >
              <Pencil size={14} className="text-white" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(true) }}
              className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm flex items-center justify-center transition-colors"
              aria-label="Hapus foto"
            >
              <Trash2 size={14} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Caption below image */}
      {(photo.caption || editMode) && (
        <div className="py-1.5 px-1">
          {editMode ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="flex-1 text-xs border border-border rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                placeholder="Tambah keterangan..."
                autoFocus
              />
              <button onClick={handleSaveCaption} className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors" aria-label="Simpan">
                <Check size={14} className="text-primary" strokeWidth={2.5} />
              </button>
              <button onClick={() => { setEditMode(false); setCaption(photo.caption ?? '') }} className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors" aria-label="Batal">
                <X size={14} className="text-muted-foreground" strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <p className="text-[13px] text-foreground leading-tight">{photo.caption}</p>
          )}
        </div>
      )}

      {preview && (
        <PhotoPreviewModal photo={photo} open={preview} onClose={() => setPreview(false)} />
      )}

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Hapus foto?"
        description="Foto ini akan dihapus permanen dari galeri."
        onConfirm={handleDelete}
        isLoading={deletePhoto.isPending}
      />
    </>
  )
}
