import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import type { GalleryPhoto } from '@/types'
import { formatDate } from '@/utils/date'
import { X } from 'lucide-react'

interface PhotoPreviewModalProps {
  photo: GalleryPhoto
  open: boolean
  onClose: () => void
}

export default function PhotoPreviewModal({ photo, open, onClose }: PhotoPreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="p-0 max-w-lg mx-auto overflow-hidden rounded-none sm:rounded-2xl border-0 bg-black/95">
        <VisuallyHidden>
          <DialogTitle>Pratinjau Foto</DialogTitle>
          <DialogDescription>Menampilkan foto yang dipilih dalam ukuran penuh.</DialogDescription>
        </VisuallyHidden>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          aria-label="Tutup"
        >
          <X size={20} />
        </button>
        <div className="w-full h-full flex flex-col justify-center min-h-[50dvh] max-h-[85dvh]">
          <img
            src={photo.imageUrl}
            alt={photo.caption ?? 'foto'}
            className="w-full object-contain max-h-[75dvh]"
          />
          {photo.caption && (
            <div className="p-4 bg-black/50 absolute bottom-0 left-0 right-0">
              <p className="text-sm font-medium text-white">{photo.caption}</p>
              <p className="text-xs text-white/70 mt-1">{formatDate(photo.createdAt)}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
