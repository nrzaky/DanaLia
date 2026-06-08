import { useParams, useNavigate } from 'react-router-dom'
import { useTransaction } from '@/hooks/useTransactions'
import PageHeader from '@/components/layout/PageHeader'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import CurrencyDisplay from '@/components/shared/CurrencyDisplay'
import { formatDate } from '@/utils/date'
import { ArrowLeft, ExternalLink, Receipt, Pencil } from 'lucide-react'

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: tx, isLoading } = useTransaction(Number(id))

  if (isLoading) return <LoadingSpinner />
  if (!tx) return <div className="p-8 text-center text-muted-foreground">Transaksi tidak ditemukan</div>

  const isDeposit = tx.transactionType === 'DEPOSIT'

  return (
    <div className="min-h-dvh bg-background">
      <PageHeader
        title="Detail Transaksi"
        subtitle={`ID #${tx.id}`}
        right={
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </button>
        }
      />

      <div className="px-4 mt-2 pb-8">
        <div className="bg-white rounded-2xl border border-border p-6 mb-4">
          <div className="flex flex-col items-center justify-center mb-6">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${isDeposit ? 'bg-green-100' : 'bg-red-100'}`}>
              <Receipt size={24} className={isDeposit ? 'text-green-600' : 'text-red-600'} />
            </div>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium mb-2 ${isDeposit ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {isDeposit ? 'Setoran' : 'Penarikan'}
            </span>
            <CurrencyDisplay
              amount={tx.amount}
              size="xl"
              className={`text-3xl font-bold ${isDeposit ? 'text-green-600' : 'text-red-600'}`}
            />
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Tanggal</span>
              <span className="font-medium">{formatDate(tx.transactionDate)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Metode Pembayaran</span>
              <span className="font-medium">{tx.paymentMethod}</span>
            </div>
            {tx.depositMessage && (
              <div className="flex flex-col py-2 border-b border-border">
                <span className="text-muted-foreground mb-1">Catatan</span>
                <span className="font-medium">{tx.depositMessage}</span>
              </div>
            )}
            {tx.proofUrl && (
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Bukti</span>
                <a
                  href={tx.proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline flex items-center gap-1"
                >
                  Lihat Foto <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6 mb-6">
          <h3 className="font-medium text-sm mb-4">Informasi Audit</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dibuat Oleh</span>
              <span className="font-medium font-mono text-xs">{tx.createdBy || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dibuat Pada</span>
              <span className="font-medium">{formatDate(tx.createdAt)}</span>
            </div>
            {tx.updatedBy && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Diperbarui Oleh</span>
                <span className="font-medium font-mono text-xs">{tx.updatedBy}</span>
              </div>
            )}
            {tx.updatedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Diperbarui Pada</span>
                <span className="font-medium">{formatDate(tx.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate(`/edit/${tx.id}`)}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium h-11 rounded-xl text-sm transition-colors"
        >
          <Pencil size={16} />
          Edit Transaksi
        </button>
      </div>
    </div>
  )
}
