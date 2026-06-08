import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatIDR, parseIDR } from '@/utils/currency'
import type { Target } from '@/types'

const schema = z.object({
  title: z.string().min(1, 'Nama target wajib diisi').max(255),
  targetAmount: z.string().min(1, 'Jumlah target wajib diisi').refine(
    (v) => parseIDR(v) > 0,
    'Jumlah harus lebih dari 0'
  ),
  description: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface TargetFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: { title: string; targetAmount: number; description?: string | null }) => Promise<void>
  isLoading?: boolean
  defaultValues?: Target
  title?: string
}

export default function TargetForm({
  open,
  onClose,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Tambah Target',
}: TargetFormProps) {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      targetAmount: defaultValues?.targetAmount ? formatIDR(defaultValues.targetAmount) : '',
      description: defaultValues?.description ?? '',
    },
  })

  const amountValue = watch('targetAmount')

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseIDR(e.target.value)
    setValue('targetAmount', raw > 0 ? formatIDR(raw) : '')
  }

  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit({
      title: data.title,
      targetAmount: parseIDR(data.targetAmount),
      description: data.description || null,
    })
    reset()
    onClose()
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-sm rounded-2xl p-6 gap-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="targetTitle" className="text-sm font-medium">Nama Target</Label>
            <Input 
              id="targetTitle" 
              {...register('title')} 
              placeholder="mis. Beli laptop baru"
              className="h-11 border-border focus-visible:ring-primary" 
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="targetAmount" className="text-sm font-medium">Jumlah Target</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground pointer-events-none">Rp</span>
              <Input
                id="targetAmount"
                value={amountValue}
                onChange={handleAmountChange}
                inputMode="numeric"
                className="pl-10 h-11 font-semibold border-border focus-visible:ring-primary"
                placeholder="0"
              />
            </div>
            {errors.targetAmount && <p className="text-xs text-destructive">{errors.targetAmount.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm font-medium">Deskripsi <span className="text-muted-foreground font-normal">(opsional)</span></Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Keterangan target..."
              rows={3}
              className="border-border focus-visible:ring-primary resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1 h-11 border-border" disabled={isLoading}>
              Batal
            </Button>
            <Button type="submit" className="flex-1 h-11 bg-primary hover:bg-primary/90 text-white font-medium" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
