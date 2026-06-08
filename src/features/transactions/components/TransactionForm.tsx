import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PAYMENT_METHODS } from '@/types'
import { formatIDR, parseIDR } from '@/utils/currency'
import { formatDateInput } from '@/utils/date'
import { useState, useRef } from 'react'
import { ImageIcon, X } from 'lucide-react'

const schema = z.object({
  amount: z.string().min(1, 'Jumlah wajib diisi').refine(
    (v) => parseIDR(v) > 0,
    'Jumlah harus lebih dari 0'
  ),
  transactionType: z.enum(['DEPOSIT', 'WITHDRAWAL']),
  paymentMethod: z.string().min(1, 'Pilih metode pembayaran'),
  transactionDate: z.string().min(1, 'Tanggal wajib diisi'),
  depositMessage: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface TransactionFormProps {
  defaultValues?: {
    amount?: number
    transactionType?: 'DEPOSIT' | 'WITHDRAWAL'
    paymentMethod?: string
    transactionDate?: string
    depositMessage?: string | null
    proofUrl?: string | null
  }
  onSubmit: (data: FormData, proofFile?: File | null) => Promise<void>
  isLoading?: boolean
  submitLabel?: string
}

export default function TransactionForm({
  defaultValues,
  onSubmit,
  isLoading,
  submitLabel = 'Simpan',
}: TransactionFormProps) {
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(defaultValues?.proofUrl ?? null)
  const fileRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: defaultValues?.amount ? formatIDR(defaultValues.amount) : '',
      transactionType: defaultValues?.transactionType ?? 'DEPOSIT',
      paymentMethod: defaultValues?.paymentMethod ?? '',
      transactionDate: defaultValues?.transactionDate
        ? formatDateInput(new Date(defaultValues.transactionDate))
        : formatDateInput(new Date()),
      depositMessage: defaultValues?.depositMessage ?? '',
    },
  })

  const amountValue = watch('amount')

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseIDR(e.target.value)
    setValue('amount', raw > 0 ? formatIDR(raw) : '')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setProofFile(file)
    setProofPreview(URL.createObjectURL(file))
  }

  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit(data, proofFile)
  })

  return (
    <form onSubmit={handleFormSubmit} className="space-y-5 px-4">
      {/* Transaction Type */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground">Jenis Transaksi</Label>
        <Select
          defaultValue={defaultValues?.transactionType ?? 'DEPOSIT'}
          onValueChange={(v) => setValue('transactionType', v as 'DEPOSIT' | 'WITHDRAWAL')}
        >
          <SelectTrigger id="transactionType" className="h-11 border-border focus:ring-primary">
            <SelectValue placeholder="Pilih jenis transaksi..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DEPOSIT">Setoran (Deposit)</SelectItem>
            <SelectItem value="WITHDRAWAL">Penarikan (Withdrawal)</SelectItem>
          </SelectContent>
        </Select>
        {errors.transactionType && (
          <p className="text-xs text-destructive">{errors.transactionType.message}</p>
        )}
      </div>

      {/* Amount */}
      <div className="space-y-1.5">
        <Label htmlFor="amount" className="text-sm font-medium text-foreground">
          Jumlah
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground pointer-events-none">
            Rp
          </span>
          <Input
            id="amount"
            value={amountValue}
            onChange={handleAmountChange}
            inputMode="numeric"
            className="pl-10 text-lg font-semibold h-12 border-border focus-visible:ring-primary"
            placeholder="0"
          />
        </div>
        {errors.amount && (
          <p className="text-xs text-destructive flex items-center gap-1">
            {errors.amount.message}
          </p>
        )}
      </div>

      {/* Payment Method */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground">Metode Pembayaran</Label>
        <Select
          defaultValue={defaultValues?.paymentMethod}
          onValueChange={(v) => setValue('paymentMethod', v)}
        >
          <SelectTrigger id="paymentMethod" className="h-11 border-border focus:ring-primary">
            <SelectValue placeholder="Pilih metode..." />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.paymentMethod && (
          <p className="text-xs text-destructive">{errors.paymentMethod.message}</p>
        )}
      </div>

      {/* Date */}
      <div className="space-y-1.5">
        <Label htmlFor="transactionDate" className="text-sm font-medium text-foreground">
          Tanggal
        </Label>
        <Input
          id="transactionDate"
          type="date"
          className="h-11 border-border focus-visible:ring-primary"
          {...register('transactionDate')}
        />
        {errors.transactionDate && (
          <p className="text-xs text-destructive">{errors.transactionDate.message}</p>
        )}
      </div>

      {/* Message */}
      <div className="space-y-1.5">
        <Label htmlFor="depositMessage" className="text-sm font-medium text-foreground">
          Catatan{' '}
          <span className="text-muted-foreground font-normal">(opsional)</span>
        </Label>
        <Textarea
          id="depositMessage"
          {...register('depositMessage')}
          placeholder="Catatan untuk setoran ini..."
          rows={3}
          className="border-border focus-visible:ring-primary resize-none"
        />
      </div>

      {/* Proof Image */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground">
          Bukti Transfer{' '}
          <span className="text-muted-foreground font-normal">(opsional)</span>
        </Label>

        {proofPreview ? (
          <div className="relative rounded-xl overflow-hidden border border-border bg-muted">
            <img src={proofPreview} alt="bukti" className="w-full max-h-52 object-cover" />
            <button
              type="button"
              onClick={() => {
                setProofFile(null)
                setProofPreview(null)
              }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full border border-dashed border-border rounded-xl p-5 text-center hover:border-primary hover:bg-accent/30 transition-colors"
          >
            <ImageIcon size={22} className="text-muted-foreground mx-auto mb-1.5" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">Ketuk untuk unggah foto bukti</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">JPG, PNG, WebP — Maks 10MB</p>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90 text-white font-medium h-11 rounded-xl text-sm"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Menyimpan...
          </span>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  )
}
