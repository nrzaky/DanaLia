import { formatIDR } from '@/utils/currency'
import { cn } from '@/lib/utils'

interface CurrencyDisplayProps {
  amount: number
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizes = {
  sm: 'text-sm font-semibold',
  md: 'text-base font-semibold',
  lg: 'text-lg font-bold',
  xl: 'text-2xl font-bold',
}

export default function CurrencyDisplay({ amount, className, size = 'md' }: CurrencyDisplayProps) {
  return (
    <span className={cn(sizes[size], 'tabular-nums', className)}>
      {formatIDR(amount)}
    </span>
  )
}
