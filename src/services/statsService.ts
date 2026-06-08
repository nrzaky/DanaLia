import { supabase } from '@/lib/supabase'
import type { Stats, Transaction } from '@/types'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

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
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .gte('transaction_date', startDate)
      .lt('transaction_date', endDate)
      .order('transaction_date', { ascending: true })
      
    if (error) throw error
      
    this.generatePDF(data as any[], `Daily Report - ${date}`)
  },

  async downloadMonthlyPDF(year: string, month: string) {
    const y = parseInt(year)
    const m = parseInt(month) - 1 // JS months are 0-indexed
    const startDate = new Date(y, m, 1).toISOString()
    const endDate = new Date(y, m + 1, 1).toISOString()
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .gte('transaction_date', startDate)
      .lt('transaction_date', endDate)
      .order('transaction_date', { ascending: true })
      
    if (error) throw error
      
    this.generatePDF(data as any[], `Monthly Report - ${year}-${month}`)
  },
  
  generatePDF(transactions: any[], title: string) {
    if (!transactions || transactions.length === 0) {
      throw new Error('Tidak ada data laporan')
    }

    const doc = new jsPDF()
    doc.text(title, 14, 15)
    
    const tableData = transactions.map(t => [
      new Date(t.transactionDate || t.transaction_date).toLocaleDateString(),
      (t.amount || 0).toString(),
      t.paymentMethod || t.payment_method || '-',
      t.depositMessage || t.deposit_message || '-'
    ])
    
    autoTable(doc, {
      startY: 20,
      head: [['Date', 'Amount', 'Payment Method', 'Message']],
      body: tableData,
    })
    
    const blob = doc.output('blob')
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${title.replace(/ /g, '_')}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  }
}
