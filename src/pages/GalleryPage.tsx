import { useState } from 'react'
import { useGallery } from '@/hooks/useGallery'
import PageHeader from '@/components/layout/PageHeader'
import PhotoCard from '@/features/gallery/components/PhotoCard'
import PhotoUploadForm from '@/features/gallery/components/PhotoUploadForm'
import EmptyState from '@/components/shared/EmptyState'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { ImageIcon, Plus } from 'lucide-react'

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

      <div className="px-4 pb-4">
        {isLoading ? (
          <LoadingSpinner />
        ) : !data?.length ? (
          <div className="rounded-2xl border border-border bg-white">
            <EmptyState
              icon={ImageIcon}
              title="Galeri masih kosong"
              description="Unggah foto pertamamu untuk memulai"
              action={
                <Button
                  onClick={() => setShowUpload(true)}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 mt-1 gap-1.5"
                >
                  <Plus size={14} /> Unggah Foto
                </Button>
              }
            />
          </div>
        ) : (
          /* Google Photos-style masonry using CSS columns */
          <div style={{ columnCount: 2, columnGap: '0.375rem' }}>
            {data.map((photo) => (
              <div key={photo.id} style={{ breakInside: 'avoid', marginBottom: '0.375rem' }}>
                <PhotoCard photo={photo} />
              </div>
            ))}
          </div>
        )}
      </div>

      <PhotoUploadForm open={showUpload} onClose={() => setShowUpload(false)} />
    </div>
  )
}
