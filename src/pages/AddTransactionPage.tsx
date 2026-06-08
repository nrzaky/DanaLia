import { useNavigate } from 'react-router-dom'
import TransactionForm from '@/features/transactions/components/TransactionForm'
import PageHeader from '@/components/layout/PageHeader'
import { useCreateTransactionWithProof, useCreateTransaction } from '@/hooks/useTransactions'
import { toast } from 'sonner'
import { parseIDR } from '@/utils/currency'
import { ArrowLeft } from 'lucide-react'

export default function AddTransactionPage() {
  const navigate = useNavigate()
  const createWithProof = useCreateTransactionWithProof()
  const create = useCreateTransaction()

  const handleSubmit = async (
    data: { amount: string; transactionType: 'DEPOSIT' | 'WITHDRAWAL'; paymentMethod: string; transactionDate: string; depositMessage?: string },
    proofFile?: File | null
  ) => {
    try {
      if (proofFile) {
        const formData = new FormData()
        formData.append('amount', String(parseIDR(data.amount)))
        formData.append('transactionType', data.transactionType)
        formData.append('paymentMethod', data.paymentMethod)
        formData.append('transactionDate', data.transactionDate)
        if (data.depositMessage) formData.append('depositMessage', data.depositMessage)
        formData.append('proof', proofFile)
        await createWithProof.mutateAsync(formData)
      } else {
        await create.mutateAsync({
          amount: parseIDR(data.amount),
          transactionType: data.transactionType,
          paymentMethod: data.paymentMethod,
          transactionDate: data.transactionDate,
          depositMessage: data.depositMessage || null,
          proofUrl: null,
        })
      }
      toast.success('Setoran berhasil dicatat')
      navigate('/')
    } catch {
      toast.error('Gagal menyimpan setoran')
    }
  }

  const isPending = createWithProof.isPending || create.isPending

  return (
    <div className="min-h-dvh bg-background">
      <PageHeader
        title="Catat Transaksi"
        subtitle="Catat setoran atau penarikan baru"
        right={
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </button>
        }
      />

      <div className="mt-2 pb-6">
        <TransactionForm
          onSubmit={handleSubmit}
          isLoading={isPending}
          submitLabel="Simpan Transaksi"
        />
      </div>
    </div>
  )
}
