import axios from 'axios'
import type { Transaction } from '../../src/db/schema'

const WEBHOOK_URL = process.env.GOOGLE_SCRIPT_URL

export async function syncTransactionToSheets(
  action: 'create' | 'update' | 'delete',
  transaction: Partial<Transaction>
): Promise<void> {
  if (!WEBHOOK_URL) {
    console.warn('[Sheets] GOOGLE_SCRIPT_URL not set, skipping sync')
    return
  }

  try {
    await axios.post(WEBHOOK_URL, {
      action,
      id: transaction.id,
      transaction_date: transaction.transactionDate ? transaction.transactionDate.toISOString() : undefined,
      amount: transaction.amount,
      payment_method: transaction.paymentMethod,
      message: transaction.depositMessage,
      proof_url: transaction.proofUrl,
      transaction_type: transaction.transactionType,
      created_by: transaction.createdBy,
      created_at: transaction.createdAt ? transaction.createdAt.toISOString() : undefined,
    })
    console.log(`[Sheets] Synced action=${action} id=${transaction.id}`)
  } catch (err: any) {
    console.error('[Sheets] Sync failed:', err?.message || err)
    // Non-fatal — do not throw, just log so it doesn't block transaction creation
  }
}
