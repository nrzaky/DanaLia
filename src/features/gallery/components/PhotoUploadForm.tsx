import { useState, useRef } from 'react'
import { useUploadPhoto } from '@/hooks/useGallery'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Upload, ImageIcon, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface PhotoUploadFormProps {
  open: boolean
  onClose: () => void
}

export default function PhotoUploadForm({ open, onClose }: PhotoUploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const uploadPhoto = useUploadPhoto()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('image/')) {
      setFile(f)
      setPreview(URL.createObjectURL(f))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    try {
      await uploadPhoto.mutateAsync({ file, caption: caption || undefined })
      toast.success('Foto berhasil diunggah')
      handleClose()
    } catch {
      toast.error('Gagal mengunggah foto')
    }
  }

  const handleClose = () => {
    setFile(null)
    setPreview(null)
    setCaption('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-sm rounded-2xl p-6 gap-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Unggah Foto</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="border border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:bg-muted/50 hover:border-primary transition-colors bg-secondary/30"
          >
            {preview ? (
              <div className="relative">
                <img src={preview} alt="preview" className="w-full h-48 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null) }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div>
                <ImageIcon size={28} className="text-muted-foreground mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-sm font-medium text-foreground">Ketuk atau seret foto ke sini</p>
                <p className="text-xs text-muted-foreground mt-1">Mendukung JPG, PNG, WebP (Maks 10MB)</p>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="caption" className="text-sm font-medium">
              Keterangan <span className="text-muted-foreground font-normal">(opsional)</span>
            </Label>
            <Input
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Tambahkan keterangan..."
              className="h-11 border-border focus-visible:ring-primary"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1 h-11 border-border" disabled={uploadPhoto.isPending}>
              Batal
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11 bg-primary hover:bg-primary/90 text-white font-medium"
              disabled={!file || uploadPhoto.isPending}
            >
              {uploadPhoto.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Mengunggah...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Upload size={16} /> Unggah
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
