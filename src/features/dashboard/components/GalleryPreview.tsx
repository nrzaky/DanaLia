import { useRecentGallery } from '@/hooks/useGallery'
import { Skeleton } from '@/components/ui/skeleton'
import { ImageIcon, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import PhotoPreviewModal from '@/features/gallery/components/PhotoPreviewModal'
import type { GalleryPhoto } from '@/types'

export default function GalleryPreview() {
  const { data, isLoading } = useRecentGallery(6)
  const [selected, setSelected] = useState<GalleryPhoto | null>(null)

  return (
    <div className="px-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-foreground">Galeri</h2>
        <Link
          to="/galeri"
          className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
        >
          Lihat semua <ArrowRight size={12} />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-1 rounded-2xl overflow-hidden border border-border">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-none" />
          ))}
        </div>
      ) : !data?.length ? (
        <div className="rounded-2xl border border-border bg-white p-6 text-center">
          <ImageIcon size={28} className="text-muted-foreground mx-auto mb-2" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">Belum ada foto</p>
          <Link to="/galeri" className="text-xs text-primary font-medium hover:underline mt-1 inline-block">
            + Unggah foto
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-0.5 rounded-2xl overflow-hidden border border-border">
          {data.map((photo) => (
            <button
              key={photo.id}
              onClick={() => setSelected(photo)}
              className="aspect-square overflow-hidden bg-muted hover:opacity-90 transition-opacity duration-150"
            >
              <img
                src={photo.imageUrl}
                alt={photo.caption ?? 'foto'}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {selected && (
        <PhotoPreviewModal
          photo={selected}
          open={!!selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
