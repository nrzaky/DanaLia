import { useNavigate, useParams } from 'react-router-dom'
import TransactionForm from '@/features/transactions/components/TransactionForm'
import PageHeader from '@/components/layout/PageHeader'
import { useTransaction, useUpdateTransaction } from '@/hooks/useTransactions'
import { transactionService } from '@/services/transactionService'
import { toast } from 'sonner'
import { parseIDR } from '@/utils/currency'
import { ArrowLeft } from 'lucide-react'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

export default function EditTransactionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: transaction, isLoading } = useTransaction(Number(id))
  const updateMutation = useUpdateTransaction()

  const handleSubmit = async (
    data: { amount: string; transactionType: 'DEPOSIT' | 'WITHDRAWAL'; paymentMethod: string; transactionDate: string; depositMessage?: string },
    proofFile?: File | null
  ) => {
    try {
      let proofUrl = transaction?.proofUrl ?? null

      if (proofFile) {
        proofUrl = await transactionService.uploadProof(proofFile)
      }

      await updateMutation.mutateAsync({
        id: Number(id),
        amount: parseIDR(data.amount),
        transactionType: data.transactionType,
        paymentMethod: data.paymentMethod,
        transactionDate: data.transactionDate,
        depositMessage: data.depositMessage || null,
        proofUrl,
      })

      toast.success('Setoran berhasil diperbarui')
      navigate('/riwayat')
    } catch {
      toast.error('Gagal memperbarui setoran')
    }
  }

  if (isLoading) return <LoadingSpinner />
  if (!transaction) return <div className="p-8 text-center text-muted-foreground">Transaksi tidak ditemukan</div>

  return (
    <div className="min-h-dvh bg-background">
      <PageHeader
        title="Edit Transaksi"
        subtitle={`ID #${transaction.id}`}
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
          defaultValues={transaction}
          onSubmit={handleSubmit}
          isLoading={updateMutation.isPending}
          submitLabel="Perbarui Transaksi"
        />
      </div>
    </div>
  )
}
