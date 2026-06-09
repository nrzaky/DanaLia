import { useState } from 'react'
import type { GalleryPhoto } from '@/types'
import PhotoPreviewModal from './PhotoPreviewModal'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { useDeletePhoto, useUpdateCaption } from '@/hooks/useGallery'
import { Trash2, Pencil, Check, X, Maximize2, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

interface PhotoCardProps {
  photo: GalleryPhoto
}

export default function PhotoCard({ photo }: PhotoCardProps) {
  const [preview, setPreview] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [caption, setCaption] = useState(photo.caption ?? '')
  const [isImageLoaded, setIsImageLoaded] = useState(false)

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

  const formattedDate = format(new Date(photo.createdAt), 'dd MMM yyyy', { locale: idLocale })

  return (
    <>
      <div className="group rounded-2xl border border-border/60 bg-card shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full animate-in fade-in zoom-in-95 duration-500">
        {/* Image Area */}
        <div 
          className="relative aspect-square overflow-hidden bg-muted cursor-pointer"
          onClick={() => setPreview(true)}
        >
          <img
            src={photo.imageUrl}
            alt={photo.caption ?? 'Gallery image'}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={() => setIsImageLoaded(true)}
          />
          
          {/* Skeleton while loading image */}
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}

          {/* Hover Overlay with Icon */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full text-white transform scale-50 group-hover:scale-100 transition-transform duration-300">
              <Maximize2 size={20} />
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <button
              onClick={(e) => { e.stopPropagation(); setEditMode(true) }}
              className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center transition-colors"
              aria-label="Edit keterangan"
            >
              <Pencil size={14} className="text-white" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(true) }}
              className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center transition-colors"
              aria-label="Hapus foto"
            >
              <Trash2 size={14} className="text-white" />
            </button>
          </div>
        </div>

        {/* Caption Area */}
        <div className="p-4 flex flex-col flex-1 gap-2">
          {editMode ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="flex-1 text-sm border border-border rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                placeholder="Tambah keterangan..."
                autoFocus
              />
              <button onClick={handleSaveCaption} className="w-8 h-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors" aria-label="Simpan">
                <Check size={16} className="text-primary" strokeWidth={2.5} />
              </button>
              <button onClick={() => { setEditMode(false); setCaption(photo.caption ?? '') }} className="w-8 h-8 shrink-0 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors" aria-label="Batal">
                <X size={16} className="text-muted-foreground" strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <>
              <h3 className="font-medium text-foreground text-sm line-clamp-2 leading-relaxed">
                {photo.caption || <span className="text-muted-foreground italic">Tanpa keterangan</span>}
              </h3>
              <div className="mt-auto pt-2 flex items-center text-[12px] text-muted-foreground gap-1.5">
                <Calendar size={13} />
                <span>{formattedDate}</span>
              </div>
            </>
          )}
        </div>
      </div>

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
