import { useState } from 'react'
import { useGallery } from '@/hooks/useGallery'
import PageHeader from '@/components/layout/PageHeader'
import PhotoCard from '@/features/gallery/components/PhotoCard'
import PhotoUploadForm from '@/features/gallery/components/PhotoUploadForm'
import EmptyState from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { ImageIcon, Plus, Image as ImageIconLoading } from 'lucide-react'

// Skeleton Loader Component
const PhotoCardSkeleton = () => (
  <div className="rounded-2xl border border-border/60 bg-card overflow-hidden flex flex-col h-full animate-pulse">
    <div className="relative aspect-square bg-muted flex items-center justify-center">
      <ImageIconLoading className="w-8 h-8 text-muted-foreground/30" />
    </div>
    <div className="p-4 flex flex-col gap-3">
      <div className="h-4 bg-muted rounded w-3/4"></div>
      <div className="h-4 bg-muted rounded w-1/2"></div>
      <div className="mt-auto pt-2 flex items-center gap-1.5">
        <div className="w-3 h-3 bg-muted rounded-full"></div>
        <div className="h-3 bg-muted rounded w-1/4"></div>
      </div>
    </div>
  </div>
)

export default function GalleryPage() {
  const { data, isLoading } = useGallery()
  const [showUpload, setShowUpload] = useState(false)

  return (
    <div className="min-h-dvh bg-background">
      <PageHeader
        title="Galeri"
        subtitle="Kenangan yang tersimpan"
        right={
          <Button
            size="sm"
            onClick={() => setShowUpload(true)}
            className="bg-primary hover:bg-primary/90 text-white h-9 px-4 rounded-lg text-sm gap-1.5"
          >
            <Plus size={15} />
            Foto
          </Button>
        }
      />

      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <PhotoCardSkeleton key={i} />
            ))}
          </div>
        ) : !data?.length ? (
          <div className="rounded-2xl border border-border bg-card shadow-sm mt-4">
            <EmptyState
              icon={ImageIcon}
              title="Galeri masih kosong"
              description="Unggah foto pertamamu untuk memulai"
              action={
                <Button
                  onClick={() => setShowUpload(true)}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 mt-2 gap-1.5"
                >
                  <Plus size={14} /> Unggah Foto
                </Button>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {data.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} />
            ))}
          </div>
        )}
      </div>

      <PhotoUploadForm open={showUpload} onClose={() => setShowUpload(false)} />
    </div>
  )
}
