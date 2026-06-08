import { supabase } from '@/lib/supabase'
import type { Stats, Transaction } from '@/types'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export const statsService = {
  async getStats(): Promise<Stats> {
    const { data, error } = await supabase.from('transactions').select('amount')
    if (error) throw error

    const totalSavings = data.reduce((sum, t) => sum + t.amount, 0)
    const totalDeposits = data.reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0)
    const totalWithdrawals = data.reduce((sum, t) => sum + (t.amount < 0 ? Math.abs(t.amount) : 0), 0)
    
    return {
      totalSavings,
      totalDeposits,
      totalWithdrawals,
      transactionCount: data.length
    }
  },
}

export const exportService = {
  async downloadDailyPDF(date: string) {
    const d = new Date(date)
    const startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString()
    const endDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).toISOString()
    
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .gte('transaction_date', startDate)
      .lt('transaction_date', endDate)
      .order('transaction_date', { ascending: true })
      
    this.generatePDF(data as any as Transaction[], `Daily Report - ${date}`)
  },

  async downloadMonthlyPDF(year: string, month: string) {
    const y = parseInt(year)
    const m = parseInt(month) - 1 // JS months are 0-indexed
    const startDate = new Date(y, m, 1).toISOString()
    const endDate = new Date(y, m + 1, 1).toISOString()
    
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .gte('transaction_date', startDate)
      .lt('transaction_date', endDate)
      .order('transaction_date', { ascending: true })
      
    this.generatePDF(data as any as Transaction[], `Monthly Report - ${year}-${month}`)
  },
  
  generatePDF(transactions: Transaction[], title: string) {
    const doc = new jsPDF()
    doc.text(title, 14, 15)
    
    const tableData = (transactions || []).map(t => [
      new Date(t.transactionDate).toLocaleDateString(),
      t.amount.toString(),
      t.paymentMethod,
      t.depositMessage || '-'
    ])
    
    ;(doc as any).autoTable({
      startY: 20,
      head: [['Date', 'Amount', 'Payment Method', 'Message']],
      body: tableData,
    })
    
    doc.save(`${title.replace(/ /g, '_')}.pdf`)
  }
}
