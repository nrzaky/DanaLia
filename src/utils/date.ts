import { format, formatDistanceToNow } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'dd MMM yyyy', { locale: localeId })
}

export function formatDateFull(date: string | Date): string {
  return format(new Date(date), 'EEEE, dd MMMM yyyy', { locale: localeId })
}

export function formatDateInput(date: string | Date): string {
  return format(new Date(date), 'yyyy-MM-dd')
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: localeId })
}

export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function getCurrentYear(): number {
  return new Date().getFullYear()
}

export function getCurrentMonth(): string {
  return format(new Date(), 'yyyy-MM')
}

export function getMonthName(month: number): string {
  return format(new Date(2000, month - 1, 1), 'MMMM', { locale: localeId })
}

export const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1).padStart(2, '0'),
  label: getMonthName(i + 1),
}))

export const YEARS = Array.from({ length: 5 }, (_, i) => {
  const y = new Date().getFullYear() - i
  return { value: String(y), label: String(y) }
})
